import path from "node:path";
import { prepare } from "./prepare-content.mjs";
import { syncAssets } from "./sync-content-assets.mjs";
import { syncMediaGallery } from "./lib/media-gallery.mjs";
export default function contentDevelopment() {
  return {
    name: "ol-content-development",
    hooks: {
      "astro:server:setup": ({ server }) => {
        let timer;
        server.watcher.add(path.resolve("src/content"));
        server.watcher.on("all", (event, file) => {
          const relative = path.relative(path.resolve("src/content"), file);
          if (
            relative.startsWith("..") ||
            relative.split(path.sep).some((p) => p.startsWith(".")) ||
            !["add", "change", "unlink", "addDir", "unlinkDir"].includes(event)
          )
            return;
          clearTimeout(timer);
          timer = setTimeout(async () => {
            try {
              prepare();
              syncAssets();
              await syncMediaGallery();
              server.ws.send({ type: "full-reload" });
            } catch (error) {
              server.config.logger.error(error.message);
            }
          }, 200);
        });
        server.httpServer?.once("close", () => clearTimeout(timer));
      },
    },
  };
}
