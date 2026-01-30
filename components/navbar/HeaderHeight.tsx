"use client";

import { useEffect } from "react";

const CSS_VAR = "--site-header-height";
const HEADER_ID = "site-header";

export default function HeaderHeight() {
  useEffect(() => {
    const header = document.getElementById(HEADER_ID);
    if (!header) return;

    const setHeightVar = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty(CSS_VAR, `${height}px`);
    };

    setHeightVar();

    const resizeObserver = new ResizeObserver(() => {
      setHeightVar();
    });
    resizeObserver.observe(header);

    window.addEventListener("resize", setHeightVar);
    window.addEventListener("orientationchange", setHeightVar);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", setHeightVar);
      window.removeEventListener("orientationchange", setHeightVar);
    };
  }, []);

  return null;
}
