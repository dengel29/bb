import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { CreateObjectivesForm } from "./CreateObjectivesForm.tsx";
import { SignInPage } from "./SignInPage.tsx";
import { HomePage } from "./Home.tsx";
import { CreateGamePage } from "./CreateGamePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/create-objectives",
    element: <CreateObjectivesForm />,
  },
  {
    path: "/play",
    element: <CreateGamePage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
