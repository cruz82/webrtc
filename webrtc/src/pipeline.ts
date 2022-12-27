import { ControlPanel, FPS, SourcePicker } from "@mediapipe/control_utils";
import "@mediapipe/control_utils/control_utils.css";
import { Options, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

let initialized: HTMLElement;

export function initializeSelfieSegmentation(
  controlElement: HTMLElement,
  canvasElement: HTMLCanvasElement
  // stream: MediaStream
) {
  console.log("Initialize Selfie Segmentation", initialized === controlElement);
  if (initialized === controlElement) {
    return;
  }
  initialized = controlElement;
  const ctx = canvasElement.getContext("2d");
  if (!ctx) {
    throw new Error(`Canvas 2d context is not available: ${canvasElement}`);
  }

  const segment = new SelfieSegmentation({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
  });

  segment.setOptions({ modelSelection: 0, selfieMode: true });
  const fps = new FPS();
  segment.onResults((result) => {
    // Update the frame rate.
    fps.tick();

    // Draw the overlays.
    ctx.save();

    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    ctx.drawImage(
      result.segmentationMask,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    // Only overwrite existing pixels.
    // if (activeEffect === "mask" || activeEffect === "both") {
    //   ctx.globalCompositeOperation = "source-in";
    //   // This can be a color or a texture or whatever...
    //   ctx.fillStyle = "#00FF007F";
    //   ctx.fillRect(0, 0, canvas.width, canvas.height);
    // } else {
    ctx.globalCompositeOperation = "source-out";
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    // }

    // Only overwrite missing pixels.
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(
      result.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    ctx.restore();
  });

  // async function sendToMediaPipe() {
  //   await segment.send({image: stream.})
  //   requestAnimationFrame(sendToMediaPipe)
  // }

  const controls = new ControlPanel(controlElement, {
    selfieMode: true,
    modelSelection: 0,
    effect: "background",
  });
  const sourcePicker = new SourcePicker({
    onSourceChanged: () => {
      segment.reset();
    },
    onFrame: async (input, size) => {
      const aspect = size.height / size.width;
      let width: number, height: number;
      if (window.innerWidth > window.innerHeight) {
        height = window.innerHeight;
        width = height / aspect;
      } else {
        width = window.innerWidth;
        height = width * aspect;
      }
      canvasElement.width = width;
      canvasElement.height = height;
      await segment.send({ image: input });
    },
  });
  controls.add([fps, sourcePicker]).on((x) => {
    const options = x as Options;
    segment.setOptions(options);
  });
}
