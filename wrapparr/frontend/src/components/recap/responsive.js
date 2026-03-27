import { useState, useEffect } from "react"

// Breakpoints
const BP = { phone: 480, tablet: 768, desktop: 1024, large: 1440 }

function getBreakpoint(w) {
  if (w <= BP.phone) return "phone"
  if (w <= BP.tablet) return "tablet"
  if (w <= BP.desktop) return "desktop"
  return "large"
}

const SIZES = {
  phone: {
    slideMaxW: "100%",
    fs: { xs: 7, sm: 8, md: 9, base: 10, lg: 12, xl: 14, "2xl": 18 },
    chartH: 70, chartHLg: 100,
    pad: "12px 12px 48px 12px",
    pillPad: "4px 8px", pillFs: 8, pillRadius: 16,
    topRight: 10, topTop: 6, topFs: 9, topPad: "4px 5px", topIcon: 11,
    dotRight: 5,
    counterFs: 9, counterTop: 6, counterLeft: 8,
    chevronBottom: 8, chevronTop: 32,
    podiumH: [60, 80, 100], posterSize: [56, 42],
  },
  tablet: {
    slideMaxW: 460,
    fs: { xs: 8, sm: 9, md: 10, base: 11, lg: 13, xl: 16, "2xl": 22 },
    chartH: 85, chartHLg: 120,
    pad: "16px 20px 44px 16px",
    pillPad: "5px 10px", pillFs: 9, pillRadius: 20,
    topRight: 24, topTop: 8, topFs: 10, topPad: "5px 8px", topIcon: 12,
    dotRight: 9,
    counterFs: 10, counterTop: 10, counterLeft: 12,
    chevronBottom: 12, chevronTop: 38,
    podiumH: [76, 100, 120], posterSize: [66, 50],
  },
  desktop: {
    slideMaxW: 500,
    fs: { xs: 9, sm: 10, md: 11, base: 12, lg: 14, xl: 18, "2xl": 26 },
    chartH: 100, chartHLg: 140,
    pad: "22px 30px 44px 20px",
    pillPad: "6px 12px", pillFs: 10, pillRadius: 20,
    topRight: 30, topTop: 8, topFs: 11, topPad: "5px 10px", topIcon: 14,
    dotRight: 12,
    counterFs: 12, counterTop: 10, counterLeft: 14,
    chevronBottom: 14, chevronTop: 42,
    podiumH: [88, 110, 132], posterSize: [74, 56],
  },
  large: {
    slideMaxW: 560,
    fs: { xs: 10, sm: 11, md: 12, base: 13, lg: 15, xl: 20, "2xl": 28 },
    chartH: 120, chartHLg: 160,
    pad: "24px 34px 44px 22px",
    pillPad: "7px 14px", pillFs: 11, pillRadius: 22,
    topRight: 40, topTop: 10, topFs: 12, topPad: "6px 12px", topIcon: 15,
    dotRight: 14,
    counterFs: 13, counterTop: 12, counterLeft: 16,
    chevronBottom: 16, chevronTop: 46,
    podiumH: [96, 120, 144], posterSize: [82, 62],
  },
}

export function useResponsive() {
  const [bp, setBp] = useState(() => getBreakpoint(typeof window !== "undefined" ? window.innerWidth : 1024))

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth))
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return { bp, ...SIZES[bp] }
}
