export function normalizeBaseUrl(value = "") {
  return String(value).trim().replace(/\/+$/, "");
}
export const SITE_URL = "https://borido.org";
export const BRAND = {
  name: "BORIDO",
  nameKo: "보리도",
  logoGold: "/brand/borido-mark-gold.png",
  logoMonochrome: "/brand/borido-mark-monochrome.png",
  tagline: "열린 불교 콘텐츠",
  description: "보리도(BORIDO)는 불교 문헌과 이야기, 작업 기록을 함께 읽고 나누는 열린 불교 콘텐츠 프로젝트입니다.",
};
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export default { SITE_URL, CONTENT_DEFAULTS, BRAND };
