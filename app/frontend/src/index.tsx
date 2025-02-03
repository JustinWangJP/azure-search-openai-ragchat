import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider, createBrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import { initializeIcons } from "@fluentui/react";
import "./index.css";

import Chat from "./pages/chat/Chat";
import ErrorPage from "./pages/ErrorPage";
import LayoutWrapper from "./layoutWrapper";
import i18next from "./i18n/config";
import { rootLoader, dataAction } from "./loader";

initializeIcons();

const router = createHashRouter([
    {
        path: "/",
        element: <LayoutWrapper />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Chat />
            },
            {
                path: "qa",
                lazy: () => import("./pages/ask/Ask")
            },
            {
                path: "fileUpload",
                lazy: () => import("./pages/fileupload/FileUpload"),
                loader: rootLoader,
                action: dataAction
            },
            {
                path: "upload",
                lazy: () => import("./pages/upload/Upload"),
                loader: rootLoader
            },
            {
                path: "*",
                lazy: () => import("./pages/NoPage")
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18next}>
            <HelmetProvider>
                <RouterProvider router={router} />
            </HelmetProvider>
        </I18nextProvider>
    </React.StrictMode>
);
