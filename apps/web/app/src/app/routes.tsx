import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/shell/AppShell";
import { HomePage } from "@/pages/HomePage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SplashPage } from "@/pages/SplashPage";
import { StartPage } from "@/pages/StartPage";
import { HoldingDetailPage } from "@/pages/HoldingDetailPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ImportStartPage } from "@/pages/ImportStartPage";
import { ImportPreviewPage } from "@/pages/ImportPreviewPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { RadarPage } from "@/pages/RadarPage";

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
      { path: "onboarding", element: <OnboardingPage /> },
      { path: "import", element: <ImportStartPage /> },
      { path: "import/:importId/preview", element: <ImportPreviewPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "radar", element: <RadarPage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      {
        path: "portfolio/:portfolioId/holdings/:holdingId",
        element: <HoldingDetailPage />,
      },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
