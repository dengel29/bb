import { Container } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Score } from "shared/types";
import { Board } from "./Board";
import { socket } from "./socket";

const id = Math.floor(
  Math.random() * 10 + Math.random() * 10 * Math.random() * 10
);

export const BoardPage = () => {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
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

  useEffect(() => {
    function onConnect(): void {
      setIsConnected(true);
    }

    function onDisconnect(): void {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <Container size="2">
      <Board broadcastClick={broadcastClick} score={score}></Board>
    </Container>
  );
};
