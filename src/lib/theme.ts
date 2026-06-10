function hexToHsl(hex: string): [number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return [Math.round(h * 360), Math.round(s * 100)]
}

export function buildBrandVars(primaryHex: string): string {
  const safe = /^#[0-9a-fA-F]{6}$/.test(primaryHex) ? primaryHex : '#A06040'
  const [h, s] = hexToHsl(safe)
  const shades: [string, number][] = [
    ['50', 97], ['100', 93], ['200', 84], ['300', 72],
    ['400', 62], ['500', 51], ['600', 41], ['700', 31],
    ['800', 21], ['900', 13],
  ]
  return shades.map(([n, l]) => `--brand-${n}:hsl(${h},${s}%,${l}%)`).join(';')
}
