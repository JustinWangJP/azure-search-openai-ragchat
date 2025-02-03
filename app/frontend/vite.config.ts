import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        preserveSymlinks: true
    },
    build: {
        outDir: "../backend/static",
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: id => {
                    if (id.includes("@fluentui/react-icons")) {
                        return "fluentui-icons";
                    } else if (id.includes("@fluentui/react")) {
                        return "fluentui-react";
                    } else if (id.includes("node_modules")) {
                        return "vendor";
                    }
                }
            }
        },
        target: "esnext"
    },
    server: {
        proxy: {
            "/content/": "http://host.docker.internal:50505",
            "/auth_setup": { target: "http://host.docker.internal:50505", changeOrigin: true },
            "/.auth/me": "http://host.docker.internal:50505",
            "/ask": "http://host.docker.internal:50505",
            "/chat": "http://host.docker.internal:50505",
            "/speech": "http://host.docker.internal:50505",
            "/config": "http://host.docker.internal:50505",
            "/upload": "http://host.docker.internal:50505",
            "/delete_uploaded": "http://host.docker.internal:50505",
            "/list_uploaded": "http://host.docker.internal:50505",
            "/chat_history": "http://host.docker.internal:50505"
        }
    }
});
