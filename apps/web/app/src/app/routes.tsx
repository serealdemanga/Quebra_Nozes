import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/shell/AppShell";
import { HomePage } from "@/pages/HomePage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SplashPage } from "@/pages/SplashPage";
import { StartPage } from "@/pages/StartPage";
import { HoldingDetailPage } from "@/pages/HoldingDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/start",
    element: <StartPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { path: "home", element: <HomePage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      {
        path: "portfolio/:portfolioId/holdings/:holdingId",
        element: <HoldingDetailPage />,
      },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
