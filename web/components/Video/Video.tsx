"use client";

import { useEffect, useRef } from "react";
import { startMediaStream, initializeSelfieSegmentation } from "webrtc";

export default function Video() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // startMediaStream().then((stream) => {
    //   videoRef.current!.srcObject = stream;
    // });
    console.log("mount");
    initializeSelfieSegmentation(controlRef.current!, canvasRef.current!);
  }, []);

  return (
    <div>
      {/* <video autoPlay ref={videoRef} /> */}
      <canvas ref={canvasRef} width={1280} height={720} />
      <div ref={controlRef} />
    </div>
  );
}
