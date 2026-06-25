import { DESIGN_ASSET_BASE_URL } from '../site-config.mjs';

const GENERATED_DESIGN_PREFIX = '/generated/design/';
const DESIGN_ASSET_SCHEME = 'design-asset:';

function normalizeAssetKey(value) {
  return String(value).replace(/^\/+/, '');
}

function externalDesignAssetUrl(value) {
  const normalizedValue = String(value);

  if (normalizedValue.startsWith(DESIGN_ASSET_SCHEME)) {
    const assetKey = normalizeAssetKey(normalizedValue.slice(DESIGN_ASSET_SCHEME.length));
    return DESIGN_ASSET_BASE_URL ? `${DESIGN_ASSET_BASE_URL}/${assetKey}` : `${GENERATED_DESIGN_PREFIX}${assetKey}`;
  }

  if (!DESIGN_ASSET_BASE_URL || !normalizedValue.startsWith(GENERATED_DESIGN_PREFIX)) {
    return normalizedValue;
  }

  return `${DESIGN_ASSET_BASE_URL}/${normalizedValue.slice(GENERATED_DESIGN_PREFIX.length)}`;
}

function visit(node) {
  if (!node || typeof node !== 'object') return;

  if ((node.type === 'image' || node.type === 'link') && typeof node.url === 'string') {
    node.url = externalDesignAssetUrl(node.url);
  }

  if (Array.isArray(node.children)) {
    node.children.forEach(visit);
  }
}

export default function remarkDesignAssetUrls() {
  return tree => {
    visit(tree);
  };
}
