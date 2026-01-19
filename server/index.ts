import express from "express";
import bodyParser from "body-parser";
import { Storage } from "@google-cloud/storage";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
const storage = new Storage();
const sh = promisify(execFile);

// helpers
async function downloadGcs(gcsPath: string, localPath: string) {
  const [, bucket, ...obj] = gcsPath.split("/");
  await storage.bucket(bucket).file(obj.join("/")).download({ destination: localPath });
}
async function uploadGcs(localPath: string, gcsPath: string, contentType: string) {
  const [, bucket, ...obj] = gcsPath.split("/");
  await storage.bucket(bucket).upload(localPath, { destination: obj.join("/"), metadata: { contentType } });
}

// POST /stitch  { clipPaths: ["gs://bkt/path1.mp4", ...], outputPath: "gs://bkt/videos/final.mp4" }
app.post("/stitch", async (req, res) => {
  try {
    const { clipPaths, outputPath } = req.body as { clipPaths: string[]; outputPath: string };
    if (!clipPaths?.length || !outputPath) return res.status(400).send("clipPaths[] and outputPath required");

    // download to /tmp
    const tmpDir = "/tmp/stitch";
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    const localClips: string[] = [];
    for (let i = 0; i < clipPaths.length; i++) {
      const p = path.join(tmpDir, `clip-${i}.mp4`);
      await downloadGcs(clipPaths[i], p);
      localClips.push(p);
    }

    // concat list
    const listPath = path.join(tmpDir, "concat.txt");
    fs.writeFileSync(listPath, localClips.map(p => `file '${p}'`).join("\n"));

    // stitch (re-encode for safety + faststart)
    const outPath = path.join(tmpDir, "final.mp4");
    await sh("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath,
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart", outPath]);

    await uploadGcs(outPath, outputPath, "video/mp4");
    return res.json({ ok: true, outputPath });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send(String(e?.message || e));
  }
});

// POST /slate { text, durationSec, outputPath, width?, height? }
app.post("/slate", async (req, res) => {
  try {
    const { text, durationSec = 8, outputPath, width = 1920, height = 1080 } =
      req.body as { text: string; durationSec?: number; outputPath: string; width?: number; height?: number };
    if (!text || !outputPath) return res.status(400).send("text and outputPath required");

    const tmpDir = "/tmp/slate";
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    const outPath = path.join(tmpDir, "slate.mp4");

    const draw = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text.replace(/:/g,"\\:")}':fontcolor=white:fontsize=64:box=1:boxcolor=black@0.4:boxborderw=24:x=(w-text_w)/2:y=(h-text_h)/2`;
    await sh("ffmpeg", [
      "-y",
      "-f","lavfi","-i",`color=c=black:s=${width}x${height}:d=${durationSec}`,
      "-f","lavfi","-t",`${durationSec}`,"-i","anullsrc=channel_layout=stereo:sample_rate=44100",
      "-shortest","-vf", draw,
      "-c:v","libx264","-pix_fmt","yuv420p","-c:a","aac","-movflags","+faststart",
      outPath
    ]);

    await uploadGcs(outPath, outputPath, "video/mp4");
    return res.json({ ok: true, outputPath });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send(String(e?.message || e));
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`FFmpeg service on ${PORT}`));
