"use client";

import { useEffect, useRef } from "react";
import { getVirtualBackgroundStream } from "webrtc";

export default function Video() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getVirtualBackgroundStream({
      video: { aspectRatio: 16 / 9, height: 360 },
    }).then((stream) => {
      if (!videoRef.current) {
        console.warn("Mounted with no video element ref");
        return;
      }
      videoRef.current.srcObject = stream;
    });
  }, []);

  return (
    <div>
      <video autoPlay ref={videoRef} />
    </div>
  );
}
