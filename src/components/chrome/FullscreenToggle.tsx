// components/chrome/FullscreenToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "../ui/button";

export default function FullscreenToggle() {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFs(isFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Initial check
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const requestFullScreen =
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullscreen ||
        docEl.msRequestFullscreen;

      const cancelFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen;

      const isFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isFullscreen) {
        if (requestFullScreen) {
          await requestFullScreen.call(docEl);
        } else {
          alert("Fullscreen API is not supported in this browser.");
        }
      } else {
        if (cancelFullScreen) {
          await cancelFullScreen.call(doc);
        }
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
      alert("Error toggling fullscreen: " + String(error));
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      title={isFs ? "Exit Fullscreen" : "Enter Fullscreen"}
      aria-label={isFs ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFs ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
    </Button>
  );
}
