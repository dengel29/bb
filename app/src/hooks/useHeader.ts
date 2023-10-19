import { useLocation } from "react-router-dom";
import { HeaderNav } from "../HeaderNav";

export const useHeader = () => {
  const location = useLocation();
  const withHeaderLocations = [
    "/",
    "/about",
    "/home",
    "/create-objectives",
    "/create-board",
    "/sign-in",
    "/play",
    "/profile",
  ];

  const header: JSX.Element | null = withHeaderLocations.some(
    (l) => l === location.pathname
  )
    ? HeaderNav()
    : null;

  return header;
};
