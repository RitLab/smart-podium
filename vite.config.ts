import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import electronEntry from "vite-plugin-electron";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
      },
    },
    plugins: [
      react(),
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App",
              );
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {},
                ),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined, // #332
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {},
                ),
              },
            },
          },
        },
        // (uaPatch dibangun lewat plugin terpisah di bawah)
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
      // Preload SESI buat webview browser dalam app (electron/preload/uaPatch.ts).
      // Dibangun terpisah karena: builder preload di atas nolak >1 input, dan
      // builder main ngeluarin ESM (package type=module) padahal preload sesi
      // di-require() sama renderer -> harus CJS. Output: preload/uaPatch.cjs.
      electronEntry([
        {
          entry: "electron/preload/uaPatch.ts",
          onstart() { /* jangan nyalain Electron dari entry ini */ },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/preload",
              lib: { entry: "electron/preload/uaPatch.ts", formats: ["cjs"] },
              rollupOptions: {
                external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                output: { entryFileNames: "[name].cjs" },
              },
            },
          },
        },
      ]),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    clearScreen: false,
  };
});
