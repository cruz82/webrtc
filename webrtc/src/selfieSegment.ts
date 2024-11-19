import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { calculateScaling, fpsToInterval } from "./utilities";

export async function segmentVideo(videoElement: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.width;
  canvas.height = videoElement.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(`Canvas 2d context is not available: ${canvas}`);
  }

  let bg: ImageBitmap;
  const image = new Image();
  image.onload = () => {
    const { dX, dY, width, height } = calculateScaling(
      image.width,
      image.height,
      canvas.width,
      canvas.height
    );
    createImageBitmap(image, dX, dY, width, height).then((bitmap) => {
      bg = bitmap;
    });
  };
  image.src = "/assets/sample_menu.png";

  const segment = new SelfieSegmentation({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
  });

  segment.setOptions({ modelSelection: 0, selfieMode: true });
  segment.onResults((result) => {
    ctx.save();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(result.segmentationMask, 0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "source-out";
    ctx.fillStyle = "#0000FF7F";
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(result.image, 0, 0, canvas.width, canvas.height);

    ctx.restore();
  });

  videoElement.requestVideoFrameCallback;
  async function sendToMediaPipe() {
    if (videoElement.videoWidth) {
      await segment.send({ image: videoElement });
    }
    setTimeout(sendToMediaPipe, fpsToInterval(30));
  }
  sendToMediaPipe();

  return canvas.captureStream();
}
