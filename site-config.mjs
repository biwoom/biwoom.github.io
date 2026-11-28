export const SITE_URL = "https://biwoom.github.io";
export const REPOSITORY_URL = "https://github.com/biwoom/biwoom.github.io";
export const LEGACY_HUB_BASE = "/hub";

// Older Markdown may still cite a public address from the former project site.
export function sitePath(value) {
  const origin = value.startsWith(`${SITE_URL}/`) ? SITE_URL : "";
  const route = value.slice(origin.length);
  const pathname = route.split(/[?#]/, 1)[0];
  if (pathname === LEGACY_HUB_BASE) return `${origin}/${route.slice(pathname.length)}`;
  return pathname.startsWith(`${LEGACY_HUB_BASE}/`)
    ? `${origin}${route.slice(LEGACY_HUB_BASE.length)}`
    : value;
}

export const ARTICLE_LABEL = "이야기카드";
export const SERIES_LABELS = { article: `${ARTICLE_LABEL} 시리즈`, blog: "블로그 시리즈" };

export const BRAND = {
  name: "BIWOOM",
  nameKo: "비움",
  logoMonochrome: "/brand/biwoom-mark-monochrome.png",
  tagline: "붓다의 지혜를 오늘의 삶으로",
  description: `비움은 불교경론과 불전문학, ${ARTICLE_LABEL}, 포스트, 미디어와 전자책을 읽고 탐구하는 공간입니다.`,
};
export const LIBRARY_LABELS = { text: "불교경론", story: "불전문학" };
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export const BLOG = { journalSeries: "blog/005.비움제작일지" };
