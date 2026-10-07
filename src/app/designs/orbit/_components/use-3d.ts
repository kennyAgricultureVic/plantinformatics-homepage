"use client";

import { useSyncExternalStore } from "react";

let webgl: boolean | undefined;
const hasWebGL = () => {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
};

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** True when the live 3D scene should run: WebGL is available and motion is welcome. False on the server. */
export function use3D() {
  return useSyncExternalStore(
    subscribe,
    () => hasWebGL() && !window.matchMedia(QUERY).matches,
    () => false,
  );
}
