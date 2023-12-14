import "./App.css";
import "@radix-ui/themes/styles.css";

import { PageContainer } from "./PageContainer";
import { Link } from "react-router-dom";

export function HomePage(): JSX.Element {
  // const [isViewTransition, setIsViewTransition] = useState("");

  // const createRoom = ({})

  // setIsViewTransition(
  //   "Opss, Your browser doesn't support View Transitions API"
  // );
  // if (document.startViewTransition) {
  //   setIsViewTransition("Yess, Your browser support View Transitions API");
  // }

  return (
    <PageContainer title={"Welcome to Bike Bingo"}>
      <h1>Welcome to Bike Bingo</h1>
      <br />
      <h2>What can you do now</h2>
      <ul>
        <li>
          <p>Sign Up</p>
        </li>
        <li>
          <p>Create a password-protected game</p>
        </li>
        <li>
          <p>Invite a friend</p>
        </li>
        <li>
          <p>Send feedback</p>p
        </li>
      </ul>
      <p>A globally* available bingo game you play in your city*</p>
      <small>*only available in Taiwan at the moment</small>

      <Link to="/sign-in">Get Playing</Link>
    </PageContainer>
  );
}
