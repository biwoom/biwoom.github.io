function normalizeBaseUrl(value = '') {
  return String(value).trim().replace(/\/+$/, '');
}

const SITE_URL = 'https://biwoom.github.io';
const DESIGN_ASSET_BASE_URL = normalizeBaseUrl(process.env.PUBLIC_DESIGN_ASSET_BASE_URL);
const DESIGN_ASSET_PROVIDER = String(process.env.DESIGN_ASSET_PROVIDER ?? 'local').trim() || 'local';
const DESIGN_ASSET_MANIFEST = String(process.env.DESIGN_ASSET_MANIFEST ?? '').trim();

export {
  DESIGN_ASSET_BASE_URL,
  DESIGN_ASSET_MANIFEST,
  DESIGN_ASSET_PROVIDER,
  SITE_URL,
  normalizeBaseUrl,
};

export default {
  SITE_URL,
  DESIGN_ASSET_BASE_URL,
  DESIGN_ASSET_PROVIDER,
  DESIGN_ASSET_MANIFEST,
};
