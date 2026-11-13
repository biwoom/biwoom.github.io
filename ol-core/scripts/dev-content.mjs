import { watchContent } from "./lib/watch-content.mjs";
import { prepare } from "./prepare-content.mjs";
import { syncAssets } from "./sync-content-assets.mjs";
import { syncMediaGallery } from "./lib/media-gallery.mjs";
export default function contentDevelopment() {
  return {
    name: "ol-content-development",
    hooks: {
      "astro:server:setup": ({ server }) => {
        const dispose = watchContent(server.watcher, async () => {
          prepare();
          syncAssets();
          await syncMediaGallery();
          server.ws.send({ type: "full-reload" });
        }, error => server.config.logger.error(error.message), {
          delay: 200,
          includeRegistry: false,
        });
        server.httpServer?.once("close", dispose);
      },
    },
  };
}
