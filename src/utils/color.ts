export function brightenColor(color: number, amount: number = 0.2): number {
    const clamp = (val: number) => Math.min(255, Math.max(0, val));

    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const newR = clamp(r + (255 - r) * amount);
    const newG = clamp(g + (255 - g) * amount);
    const newB = clamp(b + (255 - b) * amount);

    return (Math.round(newR) << 16) | (Math.round(newG) << 8) | Math.round(newB);
}