import { Link, useLocation } from "react-router-dom";
import { withHeaderLocations } from "./hooks/useHeader";
import "./styles/header-nav.css";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { domain, client } from "./domain";
import { useRef } from "react";

export const HeaderNav = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();
  const navCheckRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  const logOut = async () => {
    await fetch(`${domain}/log-out`, {
      method: "POST",
      credentials: "include",
    });
    // replace with a server response of 205 to reset content
    window.location.replace(`${client}/home`);
  };

  const authLink =
    error || (!loading && error) || (!currentUser && error) ? (
      <Link to="/sign-in">Sign In</Link>
    ) : (
      <button onClick={() => logOut()}>
        <h3>Log Out</h3>
      </button>
    );

  return (
    <nav className="full-width flex-even-row row-to-column">
      <label id="open-nav">
        <span style={{}}>▦ </span>
        <span> Bingo</span>
        <input type="checkbox" ref={navCheckRef} />
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
