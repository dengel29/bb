import { Container } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { GetBoardPlayerDTO, PlayerMap, Score } from "shared/types";
import { Board } from "./Board";
import { ConnectionState } from "./ConnectionState";
import { socket } from "./socket";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { StartButton } from "./StartButton";
import { CirclePicker } from "react-color";

export const BoardPage = () => {
  const { currentUser, loading, error } = useCurrentUser();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const initialScore: Score = new Map([
    ["mine", new Set()],
    ["theirs", new Set()],
  ]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [score, setScore] = useState(initialScore);
  const [players, setPlayers] = useState<PlayerMap>(new Map());

  const [messages, setMessages] = useState<
    { message: string; cellId: number }[]
  >([]);

  const handleReady = () => {
    // when a player clicks the ready button
    // only active if the game hasnt started yet
    //  add a "started" or "status" field to db (default="pending")
    // enum = ["pending", "running", "complete", "cancelled"]
    // add color field to boardPlayer (nullable)
    // player needs to pick a color before they can be "ready"
    // only handles sending the event to others in the room
    // payload for event should be {userId, socketId(relayed from server), color}
    socket.emit("ready", { userId: currentUser?.id, color: selectedColor });
  };
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
    socket.emit("cell:clicked", { cellId, eventType, userId: currentUser?.id });
  };

  const getPlayers = async (): Promise<GetBoardPlayerDTO[]> => {
    const boardId = window.location.pathname.split("/")[2];
    const response = await fetch(
      `http://localhost:3000/api/rooms/players?board=${boardId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await response.json();
  };

  socket.on("player:joined", (payload): void => {
    const { newPlayer, socketId } = payload;
    const newPlayersMap = new Map(players).set(socketId, newPlayer);
    setPlayers(newPlayersMap);
  });

  socket.on("player:left", (payload) => {
    const { socketId } = payload;
    const updatedPlayers = new Map(players);
    updatedPlayers.delete(socketId);
    setPlayers(updatedPlayers);
  });

  socket.on("cell:toggled", (payload) => {
    const newMessages = [...messages];
    newMessages.push({
      message: `Player with id ${payload.userId} just ${payload.eventType}ed ${payload.cellId}`,
      cellId: payload.cellId,
    });

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

    getPlayers().then((players: GetBoardPlayerDTO[]) => {
      const playerMap = players.reduce((accumulator, player) => {
        return accumulator.set(player.socketId, player);
      }, new Map());

      setPlayers(playerMap);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (currentUser && !loading && !error)
      socket.emit("room:joined", {
        boardId: window.location.pathname.split("/")[2],
        userId: currentUser.id,
        player: { user: { email: currentUser?.email, id: currentUser?.id } },
      });
  }, [loading, currentUser, error]);

  return (
    <Container size="2">
      {currentUser && <p>Me: {currentUser.email}</p>}
      {players && (
        <ConnectionState players={players} isConnected={isConnected} />
      )}
      <CirclePicker
        onChange={(e) => {
          // TODO: convert this to HSL elsewhere so we can fux with opacity
          setSelectedColor(e.hex);
        }}
        colors={[
          "#7d1a1a",
          "#a61e4d",
          "#702682",
          "#3b5bdb",
          "#1864ab",
          "#074652",
          "#133d1b",
          "#5c940d",
          "#99330b",
          "#4e2b15",
          "#252521",
          "#84a513",
        ]}
      />
      <StartButton
        players={players}
        // clickHandler={handleReady}
        color={selectedColor}
      />
      {currentUser && (
        <Board broadcastClick={broadcastClick} score={score}></Board>
      )}
    </Container>
  );
};
