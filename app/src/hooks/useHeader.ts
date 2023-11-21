import { useLocation } from "react-router-dom";
// import { HeaderNav } from "../HeaderNav";

export const withHeaderLocations = [
  { path: "/", text: "Home", docTitle: "Home", header: true },
  { path: "/about", text: "About", docTitle: "About", header: false },
  { path: "/home", text: "Home", docTitle: "Home" },
  {
    path: "/how-to-play",
    text: "How To",
    docTitle: "How To Play Bingo",
    header: true,
  },
  {
    path: "/create-objectives",
    text: "Objectives",
    docTitle: "Create Objectives",
    header: true,
  },
  { path: "/sign-in", text: "Log In", docTitle: "Log In", header: false },
  { path: "/play", text: "Play", docTitle: "Play", header: true },
  { path: "/profile", text: "Profile", docTitle: "Profile", header: true },
];
export const useHeader = () => {
  const location = useLocation();

  const header: boolean | null = withHeaderLocations.some((l) =>
    location.pathname.startsWith(l.path)
  )
    ? true
    : false;

  return header;
};
