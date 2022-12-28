import { segmentVideo } from "./selfieSegment";

const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {},
  audio: {},
};

export async function getUserMediaStream(
  constraints?: Parameters<typeof navigator.mediaDevices.getUserMedia>[0]
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    ...DEFAULT_MEDIA_CONSTRAINTS,
    ...constraints,
  });

  return stream;
}

function convertStreamToVideoElement(stream: MediaStream) {
  const videoSettings = stream.getVideoTracks()[0].getSettings();
  const videoEl = document.createElement("video");
  videoEl.autoplay = true;
  videoEl.srcObject = stream;
  videoEl.width = videoSettings.width || 0;
  videoEl.height = videoSettings.height || 0;

  return videoEl;
}

let virtualBackgroundStream: Promise<MediaStream>;
export async function getVirtualBackgroundStream(
  constraints?: Parameters<typeof navigator.mediaDevices.getUserMedia>[0]
) {
  if (!virtualBackgroundStream) {
    virtualBackgroundStream = (async () => {
      const stream = await getUserMediaStream(constraints);
      const videoEl = convertStreamToVideoElement(stream);
      return segmentVideo(videoEl);
    })();
  }

  return virtualBackgroundStream;
}
