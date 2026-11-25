export const HOME_URL = "https://biwoom.github.io/";
export const SITE_BASE = "/hub";
export const SITE_URL = new URL(SITE_BASE, HOME_URL).href;
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
  displayName: "BIWOOM HUB",
  logoGold: "/brand/biwoom-mark-gold.png",
  logoMonochrome: "/brand/biwoom-mark-monochrome.png",
  tagline: "붓다의 지혜를 오늘의 삶으로",
  description: "BIWOOM HUB는 불교 문헌과 번역·연구, 이야기의 원전, 미디어, 전자책과 포스트를 함께 읽고 탐구하는 종합 콘텐츠 플랫폼입니다.",
};
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export const BLOG = { journalSeries: "blog/005.비움제작일지" };
