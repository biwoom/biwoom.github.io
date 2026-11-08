export function normalizeBaseUrl(value = "") {
  return String(value).trim().replace(/\/+$/, "");
}
export const SITE_URL = "https://biwoom.github.io";
export const BRAND = {
  name: "BIWOOM",
  nameKo: "비움",
  displayName: "Biwoom - 비움",
  logoGold: "/brand/biwoom-mark-gold.png",
  logoMonochrome: "/brand/biwoom-mark-monochrome.png",
  tagline: "붓다의 지혜를 오늘의 삶으로",
  description: "비움(Biwoom)은 불교 문헌과 이야기, 작업 기록을 함께 읽고 나누는 열린 불교 콘텐츠 프로젝트입니다.",
};
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export default { SITE_URL, CONTENT_DEFAULTS, BRAND };
