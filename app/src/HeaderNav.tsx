import { Link } from "react-router-dom";
import "./styles/header-nav.css";
import { useCurrentUser } from "./hooks/useCurrentUser";

export const HeaderNav = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();

  const logOut = async () => {
    const response = await fetch("http://localhost:3000/log-out", {
      method: "POST",
      credentials: "include",
    });
    console.log(response);
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
      <Link to="/play">Join a game</Link>
      <button>About</button>
      {authLink}
    </div>
  );
};
