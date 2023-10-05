import { Link } from "react-router-dom";
import "./styles/header-nav.css";

export const HeaderNav = (): JSX.Element => {
  return (
    <div className="full-width flex-even-row">
      <Link to="/">Home</Link>
      <Link to="/create-objectives">Create objectives</Link>
      <Link to="/play">Join a game</Link>
      <button>About</button>
      <Link to="/sign-in">Sign In</Link>
    </div>
  );
};
