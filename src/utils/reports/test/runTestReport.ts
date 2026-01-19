export type TestReportFiles = {
  report1: File;
  report2: File;
  report3: File;
};

export async function runTestReport(files: TestReportFiles) {
  const fd = new FormData();
  fd.append("report1", files.report1);
  fd.append("report2", files.report2);
  fd.append("report3", files.report3);

  const res = await fetch("/api/reports/test/run", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to run Test report");
  }

  // Whatever your Python job returns (JSON, file url, etc.)
  return await res.json().catch(() => ({}));
}
