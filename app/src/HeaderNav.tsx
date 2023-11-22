import { Link, useLocation } from "react-router-dom";
import { withHeaderLocations } from "./hooks/useHeader";
import "./styles/header-nav.css";
import { useCurrentUser } from "./hooks/useCurrentUser";

export const HeaderNav = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();
  const { pathname } = useLocation();
  const logOut = async () => {
    await fetch("http://localhost:3000/log-out", {
      method: "POST",
      credentials: "include",
    });
    window.location.replace("http://localhost:5173/home");
  };

  const authLink =
    (loading && !currentUser) || (!loading && error) ? (
      <Link to="/sign-in">Sign In</Link>
    ) : (
      <button onClick={() => logOut()}>
        <h3>Log Out</h3>
      </button>
    );

  return (
    <nav className="full-width flex-even-row row-to-column">
      <label id="open-nav">
        •••
        <input type="checkbox" />
      </label>
      {withHeaderLocations.map((location) => {
        if (location.header) {
          return (
            <Link to={location.path} key={location.path}>
              <h3 className={location.path === pathname ? "active" : ""}>
                {location.text}
              </h3>
            </Link>
          );
        }
      })}
      {/* <Link to="/">
        <h3>Home</h3>
      </Link>
      <Link to="/create-objectives">
        <h3>Create objectives</h3>
      </Link>
      <Link to="/how-to-play">
        <h3>How to play</h3>
      </Link>
      <Link to="/play">
        <h3>Join a game</h3>
      </Link>
      <Link to="/profile">
        <h3>Profile</h3>
      </Link> */}
      {authLink}
    </nav>
  );
};
