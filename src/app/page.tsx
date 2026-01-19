"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Hard redirect to bypass Next.js router fetch errors
    window.location.href = "/agents/advisory";
  }, []);

  return null;
}
