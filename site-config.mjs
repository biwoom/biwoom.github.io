export function normalizeBaseUrl(value = "") {
  return String(value).trim().replace(/\/+$/, "");
}
export const SITE_URL = "https://biwoom.github.io";
export const BRAND = {
  name: "BIWOOM",
  nameKo: "비움",
  displayName: "BIWOOM · 비움",
  logoGold: "/brand/biwoom-mark-gold.png",
  logoMonochrome: "/brand/biwoom-mark-monochrome.png",
  tagline: "붓다의 지혜를 오늘의 삶으로",
  description: "부처님과 제자들, 불교를 만나 살아가는 사람들의 이야기를 전합니다.",
};
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export const BLOG = { journalSeries: "blog/005.비움제작일지" };
export default { SITE_URL, CONTENT_DEFAULTS, BRAND, BLOG };
