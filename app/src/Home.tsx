import { useEffect } from "react";
import "./App.css";
import "@radix-ui/themes/styles.css";
import { Text } from "@radix-ui/themes";
import { socket } from "./socket";
import { PageContainer } from "./PageContainer";

export function HomePage(): JSX.Element {
  // const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  // const [isViewTransition, setIsViewTransition] = useState("");

  // const createRoom = ({})

  // setIsViewTransition(
  //   "Opss, Your browser doesn't support View Transitions API"
  // );
  // if (document.startViewTransition) {
  //   setIsViewTransition("Yess, Your browser support View Transitions API");
  // }

  useEffect(() => {
    function onConnect(): void {
      // setIsConnected(true);
    }

    function onDisconnect(): void {
      // setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <PageContainer title={"Welcome to Bike Bingo"}>
      <Text size={"8"}>Welcome to Bingo bike</Text>
      <br />
      <Text size={"6"}>
        A globally available bingo game you play in your city
      </Text>

      <a href="/">Get Playing</a>
    </PageContainer>
  );
}
