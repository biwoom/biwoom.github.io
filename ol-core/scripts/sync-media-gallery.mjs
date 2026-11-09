import { syncMediaGallery } from "./lib/media-gallery.mjs";
const items = await syncMediaGallery();
console.log(`Prepared ${items.length} media gallery previews.`);
