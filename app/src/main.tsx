import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { CreateObjectivesForm } from "./CreateObjectivesForm.tsx";
import { SignInForm } from "./SignInForm.tsx";

const router = createBrowserRouter([
  {
    path: "/pp",
    element: <App />,
  },
  {
    path: "/create-objectives",
    element: <CreateObjectivesForm />,
  },
  {
    path: "/sign-in",
    element: <SignInForm />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
