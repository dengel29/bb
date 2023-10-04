import { useEffect, useState } from "react";
import "./App.css";
import "@radix-ui/themes/styles.css";
import { Theme, Text, Container } from "@radix-ui/themes";
import { Board } from "./Board";
import { socket } from "./socket";
import { Score } from "shared/types";
import { CreateBoardForm } from "./CreateBoardForm";
import { HeaderNav } from "./HeaderNav";
// import { ConnectionState } from './ConnectionState';

const id = Math.floor(
  Math.random() * 10 + Math.random() * 10 * Math.random() * 10
);

function App(): JSX.Element {
  // const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  // const [isViewTransition, setIsViewTransition] = useState("");
  const initialScore: Score = new Map([
    ["mine", new Set()],
    ["theirs", new Set()],
  ]);
  const [score, setScore] = useState(initialScore);
  const [messages, setMessages] = useState<
    { message: string; cellId: number }[]
  >([]);

  const broadcastClick = ({
    cellId,
    eventType,
  }: {
    cellId: number; // TODO: make sure this typing is correct
    eventType: "claim" | "unclaim";
  }): void => {
    const myNewPoints = new Set(score.get("mine"));
    if (eventType === "claim") {
      myNewPoints.add(Number(cellId));
    } else if (eventType === "unclaim") {
      myNewPoints.delete(Number(cellId));
    }

    score.set("mine", myNewPoints);
    const newScore = new Map([
      ["theirs", score.get("theirs")],
      ["mine", score.get("mine")],
    ]) as Score;
    setScore(newScore);
    socket.emit("cellClicked", { cellId, eventType, userId: id });
  };

  // const createRoom = ({})

  socket.on("colorCell", (payload) => {
    const newMessages = [...messages];
    newMessages.push({
      message: `Player with id ${payload.userId} just ${payload.eventType}ed ${payload.cellId}`,
      cellId: payload.cellId,
    });
    console.log(payload);

    const theirPoints = new Set(score.get("theirs"));

    if (payload.eventType === "claim") {
      theirPoints.add(Number(payload.cellId));
    } else if (payload.eventType === "unclaim") {
      theirPoints.delete(Number(payload.cellId));
    }

    score.set("theirs", theirPoints);
    const newScore = new Map([
      ["theirs", theirPoints],
      ["mine", score.get("mine")],
    ]) as Score;
    setScore(newScore);
    setMessages(newMessages);
  });

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
    <Theme>
      {/* <ConnectionState isConnected={isConnected} id={id} messages={messages} /> */}
      <HeaderNav />
      <div className={"App"}>
        <div>
          <CreateBoardForm></CreateBoardForm>
          <Text size={"9"}>Welcome to Bingo bike</Text>
          <br />
          <Text size={"7"}>
            A globally available bingo game you play in your city
          </Text>
          <Container size="2">
            <Board broadcastClick={broadcastClick} score={score}></Board>
          </Container>
          {/* <p>{isViewTransition}</p> */}
        </div>
      </div>
    </Theme>
  );
}

export default App;
