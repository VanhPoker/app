import { createBrowserRouter } from "react-router-dom";
import { routesConfig } from "../config/routes";
import Page500 from "../pages/500";
import SellPage from "../components/sell-page";
import DashboardRootPage from "../layout/header/dashboard/DashboardRootPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardRootPage />,
    errorElement: <Page500 />,
    children: [
      {
        path: routesConfig.sellPage,
        errorElement: <Page500 />,
        children: [
          {
            index: true,
            element: <SellPage />,
          },
        ],
      },
    ],
  },


]);
