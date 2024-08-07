export function encodeSvgToImgSrc(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
