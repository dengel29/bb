import { Link } from "react-router-dom";
import "./styles/header-nav.css";
import { useCurrentUser } from "./hooks/useCurrentUser";

export const HeaderNav = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();

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
      <button onClick={() => logOut()}>Log Out</button>
    );
  return (
    <div className="full-width flex-even-row">
      <Link to="/">Home</Link>
      <Link to="/create-objectives">Create objectives</Link>
      <Link to="/how-to-play">How to play</Link>
      <Link to="/play">Join a game</Link>
      <Link to="/profile">Profile</Link>
      {authLink}
    </div>
  );
};
