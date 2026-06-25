import { DESIGN_ASSET_BASE_URL } from './site-config';
import { url } from './url';

export function normalizeAssetPath(value: string): string {
  return value.replace(/^\.\//, '').replace(/^\/+/, '');
}

export function getGeneratedAssetUrl(collection: string, entryId: string, asset?: string): string {
  return asset ? url(`/generated/${collection}/${entryId}/${normalizeAssetPath(asset)}`) : '';
}

export function getCollectionAssetUrl(collection: string, entryId: string, asset?: string): string {
  if (!asset) return '';

  const normalizedCollection = normalizeAssetPath(collection);
  const normalizedEntryId = normalizeAssetPath(entryId);
  const normalizedAsset = normalizeAssetPath(asset);
  const externalBaseUrl = normalizedCollection === 'design' ? DESIGN_ASSET_BASE_URL : '';

  if (externalBaseUrl) {
    return `${externalBaseUrl}/${normalizedEntryId}/${normalizedAsset}`;
  }

  return getGeneratedAssetUrl(normalizedCollection, normalizedEntryId, normalizedAsset);
}

export function getDesignAssetUrl(entryId: string, asset?: string): string {
  return getCollectionAssetUrl('design', entryId, asset);
}

export function getDesignAssetKeyUrl(assetKey?: string): string {
  if (!assetKey) return '';
  const [entryId, ...assetParts] = normalizeAssetPath(assetKey).split('/');
  return entryId && assetParts.length > 0 ? getDesignAssetUrl(entryId, assetParts.join('/')) : '';
}

export function getAssetExtension(asset?: string): string {
  if (!asset) return '';
  const cleanAsset = asset.split('?')[0]?.split('#')[0] ?? asset;
  const ext = cleanAsset.match(/\.([A-Za-z0-9]+)$/)?.[1];
  return ext ? `.${ext.toLowerCase()}` : '';
}

export function getVersionedDownloadFilename(
  title: string,
  version: string,
  asset?: string,
): string {
  const baseName = `${title}-v${version}`
    .replace(/[\\/:"*?<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return `${baseName}${getAssetExtension(asset)}`;
}

export function getFirstRelativeMarkdownImage(body?: string): string | undefined {
  return Array.from((body ?? '').matchAll(/!\[.*?\]\((\.\/[^)]+)\)/g))
    .map(match => normalizeAssetPath(match[1] ?? ''))
    .find(Boolean);
}

export function getBlogThumbnailCandidates(post: {
  body?: string;
  data: { thumbnailAsset?: string };
}): string[] {
  const thumbnailAsset = post.data.thumbnailAsset?.trim();
  if (thumbnailAsset) return [normalizeAssetPath(thumbnailAsset)];

  const fallback = getFirstRelativeMarkdownImage(post.body);
  return fallback ? [fallback] : [];
}
