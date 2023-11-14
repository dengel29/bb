import { useLocation } from "react-router-dom";
// import { HeaderNav } from "../HeaderNav";

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
    "/how-to-play",
  ];

  const header: boolean | null = withHeaderLocations.some((l) =>
    location.pathname.startsWith(l)
  )
    ? true
    : false;

  return header;
};
