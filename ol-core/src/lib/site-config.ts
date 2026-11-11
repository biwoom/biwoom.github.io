import sharedConfig, { normalizeBaseUrl } from "../../../site-config.mjs";
export const SITE_URL = sharedConfig.SITE_URL;
export const SITE_URL_ORIGIN = normalizeBaseUrl(SITE_URL);
export const CONTENT_DEFAULTS = sharedConfig.CONTENT_DEFAULTS;

export const BRAND = sharedConfig.BRAND;
export const BLOG = sharedConfig.BLOG;
