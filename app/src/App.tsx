import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreateObjectivesForm } from "./CreateObjectivesForm.tsx";
import { SignInPage } from "./SignInPage.tsx";
import { HomePage } from "./Home.tsx";
import { CreateGamePage } from "./CreateGamePage";
import { LoggedInPage } from "./LoggedIn.tsx";
import { BoardPage } from "./BoardPage.tsx";
import { ProfilePage } from "./ProfilePage.tsx";
import "./index.css";
import { HowToPlayPage } from "./HowToPlayPage.tsx";
export const App = () => {
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
    {
      path: "/how-to-play",
      element: <HowToPlayPage />,
    },
  ]);
  return <RouterProvider router={router} />;
};
