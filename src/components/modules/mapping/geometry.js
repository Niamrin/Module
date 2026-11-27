export const minAreaSize = 4;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

// Coordinates and sizes are percentages of the displayed image.
export function geometry(area) {
  if (area.shape !== "rect") {
    return { x: clamp(area.x, 0, 100), y: clamp(area.y, 0, 100) };
  }
  const width = clamp(area.width ?? 20, minAreaSize, 100);
  const height = clamp(area.height ?? 15, minAreaSize, 100);
  return {
    shape: "rect",
    width,
    height,
    x: clamp(area.x, 0, 100 - width),
    y: clamp(area.y, 0, 100 - height),
  };
}

export function areaStyle(area) {
  const style = { left: area.x + "%", top: area.y + "%" };
  if (area.shape === "rect") {
    style.width = area.width + "%";
    style.height = area.height + "%";
  }
  return style;
}
