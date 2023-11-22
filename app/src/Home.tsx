import "./App.css";
import "@radix-ui/themes/styles.css";
import { Text } from "@radix-ui/themes";
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
      <Text size={"8"}>Welcome to Bingo bike</Text>
      <br />
      <p>A globally* available bingo game you play in your city</p>
      <small>only available in Taiwan at the moment</small>

      <Link to="/sign-in">Get Playing</Link>
    </PageContainer>
  );
}
