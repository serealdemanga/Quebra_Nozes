import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/shell/AppShell";
import { HomePage } from "@/pages/HomePage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SplashPage } from "@/pages/SplashPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { path: "home", element: <HomePage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
