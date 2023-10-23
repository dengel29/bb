import { Container } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import {
  GetBoardPlayerDTO,
  BoardObjectivesDTO,
  PlayerMap,
  Score,
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
  const [selectedColor, setSelectedColor] = useState<string>("white");
  const [myColor, setMyColor] = useState<string>(null);
  const [gamecolors, setGamecolors] = useState<{
    mine: string;
    theirs: string;
  }>({ mine: "", theirs: "" });

  const allColors = new Map([
    ["#ff6b6b", "red"],
    // ["#cc5de8", "purple"],
    // ["#845ef7", "violet"],
    ["#5c7cfa", "indigo"],
    ["#22b8cf", "cyan"],
    // ["#20c997", "teal"],
    // ["#51cf66", "green"],
    // ["#94d82d", "lime"],
    ["#fcc419", "yellow"],
    // ["rgb(247, 103, 7)", "orange"],
    // ["#df8545", "choco"],
    // ["#b78f6d", "brown"],
    // ["#9a9178", "sand"],
    // ["#a8c648", "jungle"],
    // ["#adb5bd", "gray"],
  ]);
  const [availableColors, setAvailableColors] =
    useState<Map<string, string>>(allColors);

  const [score, setScore] = useState(initialScore);
  const [players, setPlayers] = useState<PlayerMap>(new Map());
  const [objectives, setObjectives] = useState<BoardObjectivesDTO[]>([]);

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
    // should also change getBoardPlayers function to return color and assign it IF already chosen
    // color, at this point, indicates if a player is "ready"
    socket.emit("player:ready", {
      userId: currentUser?.id,
      boardId: window.location.pathname.split("/")[2],
      color: selectedColor,
    });

    // on ack, disable color and ready button
  };

  const handleGameStart = () => {
    socket.emitWithAck("game:started", {
      boardId: window.location.pathname.split("/")[2],
    });
  };

  socket.on(
    "objectives:created",
    (payload: SocketPayload["objectives:created"]) => {
      setObjectives(payload);
    }
  );

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

  const getObjectives = async (): Promise<BoardObjectivesDTO[]> => {
    const boardId = window.location.pathname.split("/")[2];

    const response = await fetch(
      `http://localhost:3000/api/rooms/objectives?board=${boardId}`,
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

  socket.on("player:left", (payload) => {
    const { socketId } = payload;
    const updatedPlayers = new Map(players);
    updatedPlayers.delete(socketId);
    setPlayers(updatedPlayers);
  });

  socket.on(
    "player:waiting",
    ({ userId, socketId, color }: SocketPayload["player:waiting"]): void => {
      const updatedPlayers = new Map(players) as PlayerMap;
      const player = updatedPlayers.get(socketId);

      const newColors = new Map(allColors);
      const iterator = newColors.entries();
      console.log("newest color color ", color);
      const colors = new Set<string>([color]);
      if (player) {
        player.color = color;
        setPlayers(updatedPlayers);
        // TODO: delete the color from the availableColors list
      }

      Array.from(players.values()).forEach((p) => {
        if (p?.color && currentUser && currentUser.id === Number(userId))
          colors.add(p.color);
      });

      for (let i = 0; i < availableColors.size; i++) {
        const [_key, value] = iterator.next().value;
        if (colors.has(value)) {
          newColors.delete(_key);
        }
      }
      setAvailableColors(newColors);
    }
  );
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
      const playerMap: PlayerMap = players.reduce((accumulator, player) => {
        return accumulator.set(player.socketId, player);
      }, new Map());
      const colors: Set<string> = new Set([]);
      playerMap.forEach((player) => {
        if (player?.color) colors.add(player.color);
      });
      const newColors = new Map(allColors);
      const iterator = newColors.entries();
      console.log(colors);
      for (let i = 0; i < availableColors.size; i++) {
        const [_key, value] = iterator.next().value;
        if (colors.has(value)) newColors.delete(_key);
      }
      setAvailableColors(newColors);
      setPlayers(playerMap);
    });

    getObjectives().then((objectives: BoardObjectivesDTO[]) => {
      setObjectives(objectives);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // emit room joined when joining a room
  useEffect(() => {
    if (currentUser && !loading && !error)
      socket.emit("room:joined", {
        boardId: window.location.pathname.split("/")[2],
        userId: currentUser.id,
        player: { user: { email: currentUser?.email, id: currentUser?.id } },
      });
  }, [loading, currentUser, error]);

  const [allReady, setAllReady] = useState<boolean>(false);

  // check if all players ready
  useEffect(() => {
    const newGameColors = { mine: "", theirs: "" };
    const allPlayersReady = (): boolean => {
      return Array.from(players.values()).every((player) => {
        if (currentUser && player.user.id === currentUser?.id) {
          newGameColors.mine = player.color!;
        } else {
          newGameColors.theirs = player.color!;
        }
        return player.color;
      });
    };
    setGamecolors(newGameColors);
    setAllReady(allPlayersReady());
  }, [players, currentUser]);

  return (
    <Container size="2">
      {currentUser && <p>Me: {currentUser.email}</p>}
      {players && (
        <ConnectionState
          players={players}
          isConnected={isConnected}
          myColor={myColor}
          currentUser={currentUser}
        />
      )}
      {!allReady && (
      <CirclePicker
          onChange={(color, event) => {
            console.log(event.target);
          // TODO: convert this to HSL elsewhere so we can fux with opacity
            setMyColor(availableColors.get(event.target.title)!);
            setSelectedColor(availableColors.get(event.target.title)!);
        }}
          colors={Array.from(availableColors.keys())}
        />
      )}
      <StartButton
        clickHandler={handleReady}
        color={selectedColor}
        allReady={allReady}
      />
      {currentUser && (
        <Board
          broadcastClick={broadcastClick}
          score={score}
          allReady={allReady}
          generateBoard={handleGameStart}
          objectives={objectives}
          gameColors={gamecolors}
        ></Board>
      )}
    </Container>
  );
};
