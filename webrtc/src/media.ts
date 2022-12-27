const DEFAULT_MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {},
  audio: {},
};

export async function startMediaStream(
  constraints?: Parameters<typeof navigator.mediaDevices.getUserMedia>[0]
) {
  const stream = await navigator.mediaDevices.getUserMedia({
    ...DEFAULT_MEDIA_CONSTRAINTS,
    ...constraints,
  });

  return stream;
}
