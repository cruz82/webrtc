export function calculateScaling(
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number
) {
  const outputAspect = destinationHeight / destinationWidth;
  const inputAspect = sourceHeight / sourceWidth;
  const dAspect = inputAspect / outputAspect;

  let dX = 0;
  let dY = 0;
  let width = sourceWidth;
  let height = sourceHeight;

  if (dAspect > 1) {
    height = sourceHeight / dAspect;
    dY = (sourceHeight - height) / 2;
  } else {
    width = sourceWidth * dAspect;
    dX = (sourceWidth - width) / 2;
  }

  return { dX, dY, width, height };
}

export function fpsToInterval(fps: number) {
  return 1000 / fps;
}
