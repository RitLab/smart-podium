// vite.config.ts
import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "file:///D:/web-dev/smart-podium/node_modules/vite/dist/node/index.js";
import react from "file:///D:/web-dev/smart-podium/node_modules/@vitejs/plugin-react/dist/index.js";
import electron from "file:///D:/web-dev/smart-podium/node_modules/vite-plugin-electron/dist/simple.mjs";

// package.json
var package_default = {
  name: "smart-podium",
  version: "0.0.18",
  main: "dist-electron/main/index.js",
  description: "Smart Podium",
  author: "Muhammad Abdul Karim",
  license: "MIT",
  private: true,
  debug: {
    env: {
      VITE_DEV_SERVER_URL: "http://127.0.0.1:7777/"
    }
  },
  type: "module",
  scripts: {
    dev: "vite",
    build: "tsc && vite build && electron-builder",
    preview: "vite preview",
    pretest: "vite build --mode=test",
    mock: "npx json-server src/mock/db.json",
    release: "tsc && vite build && electron-builder --publish always"
  },
  dependencies: {
    "@react-three/drei": "^9.88.17",
    "@react-three/fiber": "^8.15.19",
    "@reduxjs/toolkit": "^2.11.2",
    axios: "^1.13.2",
    clsx: "^2.1.1",
    "electron-updater": "^6.3.9",
    "lucide-react": "^0.561.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "react-pdf": "^10.2.0",
    "react-player": "^3.4.0",
    "react-redux": "^9.2.0",
    "react-router": "^7.10.1",
    three: "^0.182.0"
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    autoprefixer: "^10.4.20",
    electron: "^33.2.0",
    "electron-builder": "^24.13.3",
    "json-server": "^1.0.0-beta.3",
    postcss: "^8.4.49",
    "postcss-import": "^16.1.0",
    tailwindcss: "^3.4.15",
    typescript: "^5.4.2",
    vite: "^5.4.11",
    "vite-plugin-electron": "^0.29.0",
    "vite-plugin-electron-renderer": "^0.14.6"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "D:\\web-dev\\smart-podium";
var vite_config_default = defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
  return {
    define: {
      __APP_VERSION__: JSON.stringify(package_default.version)
    },
    resolve: {
      alias: {
        "@": path.join(__vite_injected_original_dirname, "src")
      }
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
                /* For `.vscode/.debug.script.mjs` */
                "[startup] Electron App"
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
                  "dependencies" in package_default ? package_default.dependencies : {}
                )
              }
            }
          }
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : void 0,
              // #332
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in package_default ? package_default.dependencies : {}
                )
              }
            }
          }
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {}
      })
    ],
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(package_default.debug.env.VITE_DEV_SERVER_URL);
      return {
        host: url.hostname,
        port: +url.port
      };
    })(),
    clearScreen: false
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcd2ViLWRldlxcXFxzbWFydC1wb2RpdW1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdlYi1kZXZcXFxcc21hcnQtcG9kaXVtXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWItZGV2L3NtYXJ0LXBvZGl1bS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJtU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJub2RlOnBhdGhcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZVwiO1xyXG5pbXBvcnQgcGtnIGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4ge1xyXG4gIHJtU3luYyhcImRpc3QtZWxlY3Ryb25cIiwgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xyXG5cclxuICBjb25zdCBpc1NlcnZlID0gY29tbWFuZCA9PT0gXCJzZXJ2ZVwiO1xyXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSBcImJ1aWxkXCI7XHJcbiAgY29uc3Qgc291cmNlbWFwID0gaXNTZXJ2ZSB8fCAhIXByb2Nlc3MuZW52LlZTQ09ERV9ERUJVRztcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGRlZmluZToge1xyXG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHBrZy52ZXJzaW9uKSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGguam9pbihfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgZWxlY3Ryb24oe1xyXG4gICAgICAgIG1haW46IHtcclxuICAgICAgICAgIC8vIFNob3J0Y3V0IG9mIGBidWlsZC5saWIuZW50cnlgXHJcbiAgICAgICAgICBlbnRyeTogXCJlbGVjdHJvbi9tYWluL2luZGV4LnRzXCIsXHJcbiAgICAgICAgICBvbnN0YXJ0KGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52LlZTQ09ERV9ERUJVRykge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgICAgICAgICAgLyogRm9yIGAudnNjb2RlLy5kZWJ1Zy5zY3JpcHQubWpzYCAqLyBcIltzdGFydHVwXSBFbGVjdHJvbiBBcHBcIixcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFyZ3Muc3RhcnR1cCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdml0ZToge1xyXG4gICAgICAgICAgICBidWlsZDoge1xyXG4gICAgICAgICAgICAgIHNvdXJjZW1hcCxcclxuICAgICAgICAgICAgICBtaW5pZnk6IGlzQnVpbGQsXHJcbiAgICAgICAgICAgICAgb3V0RGlyOiBcImRpc3QtZWxlY3Ryb24vbWFpblwiLFxyXG4gICAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBPYmplY3Qua2V5cyhcclxuICAgICAgICAgICAgICAgICAgXCJkZXBlbmRlbmNpZXNcIiBpbiBwa2cgPyBwa2cuZGVwZW5kZW5jaWVzIDoge30sXHJcbiAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJlbG9hZDoge1xyXG4gICAgICAgICAgLy8gU2hvcnRjdXQgb2YgYGJ1aWxkLnJvbGx1cE9wdGlvbnMuaW5wdXRgLlxyXG4gICAgICAgICAgLy8gUHJlbG9hZCBzY3JpcHRzIG1heSBjb250YWluIFdlYiBhc3NldHMsIHNvIHVzZSB0aGUgYGJ1aWxkLnJvbGx1cE9wdGlvbnMuaW5wdXRgIGluc3RlYWQgYGJ1aWxkLmxpYi5lbnRyeWAuXHJcbiAgICAgICAgICBpbnB1dDogXCJlbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzXCIsXHJcbiAgICAgICAgICB2aXRlOiB7XHJcbiAgICAgICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgICAgc291cmNlbWFwOiBzb3VyY2VtYXAgPyBcImlubGluZVwiIDogdW5kZWZpbmVkLCAvLyAjMzMyXHJcbiAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxyXG4gICAgICAgICAgICAgIG91dERpcjogXCJkaXN0LWVsZWN0cm9uL3ByZWxvYWRcIixcclxuICAgICAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogT2JqZWN0LmtleXMoXHJcbiAgICAgICAgICAgICAgICAgIFwiZGVwZW5kZW5jaWVzXCIgaW4gcGtnID8gcGtnLmRlcGVuZGVuY2llcyA6IHt9LFxyXG4gICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIFBsb3lmaWxsIHRoZSBFbGVjdHJvbiBhbmQgTm9kZS5qcyBBUEkgZm9yIFJlbmRlcmVyIHByb2Nlc3MuXHJcbiAgICAgICAgLy8gSWYgeW91IHdhbnQgdXNlIE5vZGUuanMgaW4gUmVuZGVyZXIgcHJvY2VzcywgdGhlIGBub2RlSW50ZWdyYXRpb25gIG5lZWRzIHRvIGJlIGVuYWJsZWQgaW4gdGhlIE1haW4gcHJvY2Vzcy5cclxuICAgICAgICAvLyBTZWUgXHVEODNEXHVEQzQ5IGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi12aXRlL3ZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyXHJcbiAgICAgICAgcmVuZGVyZXI6IHt9LFxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICBzZXJ2ZXI6XHJcbiAgICAgIHByb2Nlc3MuZW52LlZTQ09ERV9ERUJVRyAmJlxyXG4gICAgICAoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocGtnLmRlYnVnLmVudi5WSVRFX0RFVl9TRVJWRVJfVVJMKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaG9zdDogdXJsLmhvc3RuYW1lLFxyXG4gICAgICAgICAgcG9ydDogK3VybC5wb3J0LFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0pKCksXHJcbiAgICBjbGVhclNjcmVlbjogZmFsc2UsXHJcbiAgfTtcclxufSk7XHJcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwic21hcnQtcG9kaXVtXCIsXHJcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4wLjE4XCIsXHJcbiAgXCJtYWluXCI6IFwiZGlzdC1lbGVjdHJvbi9tYWluL2luZGV4LmpzXCIsXHJcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlNtYXJ0IFBvZGl1bVwiLFxyXG4gIFwiYXV0aG9yXCI6IFwiTXVoYW1tYWQgQWJkdWwgS2FyaW1cIixcclxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcclxuICBcInByaXZhdGVcIjogdHJ1ZSxcclxuICBcImRlYnVnXCI6IHtcclxuICAgIFwiZW52XCI6IHtcclxuICAgICAgXCJWSVRFX0RFVl9TRVJWRVJfVVJMXCI6IFwiaHR0cDovLzEyNy4wLjAuMTo3Nzc3L1wiXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcclxuICBcInNjcmlwdHNcIjoge1xyXG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXHJcbiAgICBcImJ1aWxkXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgJiYgZWxlY3Ryb24tYnVpbGRlclwiLFxyXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXHJcbiAgICBcInByZXRlc3RcIjogXCJ2aXRlIGJ1aWxkIC0tbW9kZT10ZXN0XCIsXHJcbiAgICBcIm1vY2tcIjogXCJucHgganNvbi1zZXJ2ZXIgc3JjL21vY2svZGIuanNvblwiLFxyXG4gICAgXCJyZWxlYXNlXCI6IFwidHNjICYmIHZpdGUgYnVpbGQgJiYgZWxlY3Ryb24tYnVpbGRlciAtLXB1Ymxpc2ggYWx3YXlzXCJcclxuICB9LFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQHJlYWN0LXRocmVlL2RyZWlcIjogXCJeOS44OC4xN1wiLFxyXG4gICAgXCJAcmVhY3QtdGhyZWUvZmliZXJcIjogXCJeOC4xNS4xOVwiLFxyXG4gICAgXCJAcmVkdXhqcy90b29sa2l0XCI6IFwiXjIuMTEuMlwiLFxyXG4gICAgXCJheGlvc1wiOiBcIl4xLjEzLjJcIixcclxuICAgIFwiY2xzeFwiOiBcIl4yLjEuMVwiLFxyXG4gICAgXCJlbGVjdHJvbi11cGRhdGVyXCI6IFwiXjYuMy45XCIsXHJcbiAgICBcImx1Y2lkZS1yZWFjdFwiOiBcIl4wLjU2MS4wXCIsXHJcbiAgICBcInJlYWN0XCI6IFwiXjE4LjMuMVwiLFxyXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMy4xXCIsXHJcbiAgICBcInJlYWN0LXBkZlwiOiBcIl4xMC4yLjBcIixcclxuICAgIFwicmVhY3QtcGxheWVyXCI6IFwiXjMuNC4wXCIsXHJcbiAgICBcInJlYWN0LXJlZHV4XCI6IFwiXjkuMi4wXCIsXHJcbiAgICBcInJlYWN0LXJvdXRlclwiOiBcIl43LjEwLjFcIixcclxuICAgIFwidGhyZWVcIjogXCJeMC4xODIuMFwiXHJcbiAgfSxcclxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XHJcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIl4xOC4zLjEyXCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMy4xXCIsXHJcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMy4zXCIsXHJcbiAgICBcImF1dG9wcmVmaXhlclwiOiBcIl4xMC40LjIwXCIsXHJcbiAgICBcImVsZWN0cm9uXCI6IFwiXjMzLjIuMFwiLFxyXG4gICAgXCJlbGVjdHJvbi1idWlsZGVyXCI6IFwiXjI0LjEzLjNcIixcclxuICAgIFwianNvbi1zZXJ2ZXJcIjogXCJeMS4wLjAtYmV0YS4zXCIsXHJcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjQ5XCIsXHJcbiAgICBcInBvc3Rjc3MtaW1wb3J0XCI6IFwiXjE2LjEuMFwiLFxyXG4gICAgXCJ0YWlsd2luZGNzc1wiOiBcIl4zLjQuMTVcIixcclxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjQuMlwiLFxyXG4gICAgXCJ2aXRlXCI6IFwiXjUuNC4xMVwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1lbGVjdHJvblwiOiBcIl4wLjI5LjBcIixcclxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcIjogXCJeMC4xNC42XCJcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2UCxTQUFTLGNBQWM7QUFDcFIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGNBQWM7OztBQ0pyQjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLEVBQ2YsUUFBVTtBQUFBLEVBQ1YsU0FBVztBQUFBLEVBQ1gs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
