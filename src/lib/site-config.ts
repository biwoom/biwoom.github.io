import sharedConfig, { normalizeBaseUrl } from '../../site-config.mjs';

export const SITE_URL = sharedConfig.SITE_URL;
export const SITE_URL_ORIGIN = normalizeBaseUrl(SITE_URL);

export const DESIGN_ASSET_BASE_URL = normalizeBaseUrl(import.meta.env.PUBLIC_DESIGN_ASSET_BASE_URL)
  || sharedConfig.DESIGN_ASSET_BASE_URL;

export const DESIGN_ASSET_PROVIDER = String(import.meta.env.DESIGN_ASSET_PROVIDER ?? sharedConfig.DESIGN_ASSET_PROVIDER)
  .trim() || 'local';

export const DESIGN_ASSET_MANIFEST = String(import.meta.env.DESIGN_ASSET_MANIFEST ?? sharedConfig.DESIGN_ASSET_MANIFEST)
  .trim();
