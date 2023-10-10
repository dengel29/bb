import { Link } from "react-router-dom";
import "./styles/header-nav.css";
import { useCurrentUser } from "./hooks/useCurrentUser";

export const HeaderNav = (): JSX.Element => {
  const { currentUser, isLoading, isError } = useCurrentUser();

  const logOut = () => {
    fetch("/log-out", {
      method: "POST",
    });
  };
  const authLink = () => {
    if ((!isLoading && !currentUser) || (!isLoading && isError)) {
      return <Link to="/sign-in">Sign In</Link>;
    } else {
      return (
        <a href="/log-out" onClick={() => logOut()}>
          Log Out <strong>{currentUser?.email.split("@")[0]}</strong>
        </a>
      );
    }
  };
  <Link to="/sign-in">Sign In</Link>;
  return (
    <div className="full-width flex-even-row">
      <Link to="/">Home</Link>
      <Link to="/create-objectives">Create objectives</Link>
      <Link to="/play">Join a game</Link>
      <button>About</button>
      {authLink()}
    </div>
  );
};
