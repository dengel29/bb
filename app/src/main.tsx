import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { CreateObjectivesForm } from "./CreateObjectivesForm.tsx";
import { SignInPage } from "./SignInPage.tsx";
import { HomePage } from "./Home.tsx";
import { CreateGamePage } from "./CreateGamePage";
import { LoggedInPage } from "./LoggedIn.tsx";
import { BoardPage } from "./BoardPage.tsx";
import { ProfilePage } from "./ProfilePage.tsx";

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
    path: "/play/:boardId",
    element: <BoardPage />,
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/login-success",
    element: <LoggedInPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
