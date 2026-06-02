// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var __electron_vite_injected_dirname = "F:\\ASSISTANT";
var electron_vite_config_default = defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": resolve("src/main")
      }
    },
    build: {
      rollupOptions: {
        external: ["electron", "electron-store", "electron-updater", "@electron-toolkit/utils"]
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ["electron"],
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts"),
          capture: resolve(__electron_vite_injected_dirname, "src/preload/capture.ts")
        }
      }
    }
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve("src/renderer/src"),
        "@components": resolve("src/renderer/src/components"),
        "@pages": resolve("src/renderer/src/pages"),
        "@stores": resolve("src/renderer/src/stores"),
        "@services": resolve("src/renderer/src/services"),
        "@hooks": resolve("src/renderer/src/hooks"),
        "@lib": resolve("src/renderer/src/lib"),
        "@typings": resolve("src/renderer/src/types")
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__electron_vite_injected_dirname, "src/renderer/index.html"),
          capture: resolve(__electron_vite_injected_dirname, "src/renderer/capture/index.html")
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
