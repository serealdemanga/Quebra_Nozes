import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";
import { AppStoreProvider } from "@/core/state/app_store";
import { DataSourcesProvider } from "@/core/data/react";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStoreProvider>
      <DataSourcesProvider>
        <RouterProvider router={router} />
      </DataSourcesProvider>
    </AppStoreProvider>
  </React.StrictMode>,
);
