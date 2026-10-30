export function normalizeBaseUrl(value = "") {
  return String(value).trim().replace(/\/+$/, "");
}
export const SITE_URL = "https://biwoom.github.io";
export const CONTENT_DEFAULTS = { author: "비움", lang: "ko", license: "CC0" };
export default { SITE_URL, CONTENT_DEFAULTS };
