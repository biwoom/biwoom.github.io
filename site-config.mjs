export const HOME_URL = "https://biwoom.github.io/";
export const HUB_ORIGIN = "https://biwoom.github.io";
export const SITE_BASE = "/hub";
export const SITE_URL = new URL(SITE_BASE, HUB_ORIGIN).href;
export const REPOSITORY_URL = "https://github.com/biwoom/hub";

// Registry and vault paths are independent of the public deployment prefix.
export function hubPath(value) {
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  const pathname = value.split(/[?#]/, 1)[0];
  return pathname === SITE_BASE || pathname.startsWith(`${SITE_BASE}/`)
    ? value
    : `${SITE_BASE}${value}`;
}

export function stripHubBase(pathname) {
  if (pathname === SITE_BASE) return "/";
  return pathname.startsWith(`${SITE_BASE}/`) ? pathname.slice(SITE_BASE.length) : pathname;
}

export const BRAND = {
  name: "BIWOOM HUB",
  nameKo: "비움",
  logoGold: "/brand/biwoom-mark-gold.png",
  logoMonochrome: "/brand/biwoom-mark-monochrome.png",
  tagline: "붓다의 지혜를 오늘의 삶으로",
  description: "BIWOOM HUB는 불교경론의 번역·연구와 불전문학의 전기·설화·게송을 비롯해 미디어, 전자책과 포스트를 읽고 탐구하는 공간입니다.",
};
export const LIBRARY_LABELS = { text: "불교경론", story: "불전문학" };
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export const BLOG = { journalSeries: "blog/005.비움제작일지" };
