import { Container } from "@radix-ui/themes";
import "./styles/board.css";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GetBoardPlayerDTO,
  BoardObjectivesDTO,
  PlayerMap,
  Score,
  SocketPayload,
} from "shared/types";
import { Board } from "./Board";
import { ConnectionState } from "./ConnectionState";
import { socket } from "./socket";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { StartButton } from "./StartButton";
import { CirclePicker } from "react-color";
import { get } from "./requests";

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
  // useQuery({queryKey: ['players'], })

  const boardId = window.location.pathname.split("/")[2];
  const getObjectives = async (): Promise<BoardObjectivesDTO[]> => {
    const response = await get<BoardObjectivesDTO[]>(
      `/api/rooms/objectives?board=${boardId}`,
      true
    );
    return response;
  };

  const {
    data: objectives,
    refetch: refetchObjectives,
    status: objectivesStatus,
  } = useQuery({
    queryKey: ["objectives", boardId],
    queryFn: getObjectives,
  });

  const getPlayers = async (): Promise<PlayerMap> => {
    const boardId = window.location.pathname.split("/")[2];
    const response = await get<GetBoardPlayerDTO[]>(
      `/api/rooms/players?board=${boardId}`,
      true
    );
    const playersMap: PlayerMap = new Map(
      response.map((player) => [player.socketId!, player])
    );
    return playersMap;
  };
  
  const {
    data: players,
    refetch: refetchPlayers,
    status: playersStatus,
  } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });

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
    if (currentUser) {
      const payload: SocketPayload["player:ready"] = {
        userId: currentUser.id,
      boardId: window.location.pathname.split("/")[2],
      color: selectedColor,
      };
      socketEmit("player:ready", payload);
    }

    // on ack, disable color and ready button
    refetchPlayers();
  };

  const handleGameStart = () => {
    const payload: SocketPayload["game:started"] = {
      boardId: window.location.pathname.split("/")[2],
    };
    socketEmit("game:started", payload);
  };

  socketOn("objectives:created", () => {
    refetchObjectives();
  });

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
    socket.emit("cell:clicked", {
      cellId,
      eventType,
      boardId: window.location.pathname.split("/")[2],
      userId: currentUser?.id,
    });
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

  // on("player:ready", (payload: PossiblePayloads) => {
  //   console.log(payload);
  // });

  socket.on("player:joined", (payload): void => {
    const { newPlayer, socketId } = payload;
    const newPlayersMap = new Map(players);

    // make sure we aren't adding same user twice
    const duplicatePlayer = Array.from(players.values()).find(
      (player) => player.user.id === newPlayer.id
    );

    if (duplicatePlayer && duplicatePlayer.socketId) {
      newPlayersMap.delete(duplicatePlayer.socketId);
    }

    newPlayersMap.set(socketId, newPlayer);
    setPlayers(newPlayersMap);
  });

  socketOn("player:left", (payload) => {
    const { socketId } = payload as SocketPayload["player:left"];
    const updatedPlayers = new Map(players);
    updatedPlayers.delete(socketId);
    setPlayers(updatedPlayers);
  });

  socketOn("player:joined", (payload) => {
    const { socketId, newPlayer } = payload as SocketPayload["player:joined"];
    const newPlayersMap = new Map(players).set(socketId, newPlayer);
    console.log("new players after join: ", Array.from(newPlayersMap));
    setPlayers(newPlayersMap);
  });

  // socket.on("player:joined", ({ newPlayer, socketId }): void => {
  //   const newPlayersMap = new Map(players).set(socketId, newPlayer);
  //   console.log("new players after join: ", Array.from(newPlayersMap));
  //   setPlayers(newPlayersMap);
  // });

  // socket.on("player:left", ({ socketId }: SocketPayload["player:left"]) => {
  //   const updatedPlayers = new Map(players);
  //   updatedPlayers.delete(socketId);
  //   setPlayers(updatedPlayers);
  // });

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

  socket.on(
    "cell:toggled",
    ({ userId, cellId, eventType }: SocketPayload["cell:toggled"]) => {
      const newMessages = [...messages];
      newMessages.push({
        message: `Player with id ${userId} just ${eventType}ed ${cellId}`,
        cellId: cellId,
      });

      const theirPoints = new Set(score.get("theirs"));

      if (eventType === "claim") {
        theirPoints.add(Number(cellId));
      } else if (eventType === "unclaim") {
        theirPoints.delete(Number(cellId));
      }

      score.set("theirs", theirPoints);
      const newScore = new Map([
        ["theirs", theirPoints],
        ["mine", score.get("mine")],
      ]) as Score;
      setScore(newScore);
      setMessages(newMessages);
    }
  );

  // fetch data
  useEffect(() => {
    function onConnect(): void {
      setIsConnected(true);
    }

    function onDisconnect(): void {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (
      !players ||
      players?.size < 1 ||
      !objectives ||
      !currentUser ||
      playersStatus != "success" ||
      objectivesStatus !== "success"
    ) {
      console.log("thats a shame, no players");
      return;
    }
    const myPoints = new Set(
      objectives.flatMap((o) =>
        o.claimedByPlayerId === currentUser?.id ? o.objectiveId : []
      )
    );

    const otherPlayer: [string, GetBoardPlayerDTO] | undefined = Array.from(
      players
    ).find((element) => {
      return element[1].user.id != currentUser?.id;
    });

    if (!otherPlayer) {
      console.log("thats a shame, no other PLAYERS");
      return;
    }
    const theirPoints = new Set(
      objectives.flatMap((o) =>
        o.claimedByPlayerId === otherPlayer[1].user.id ? o.objectiveId : []
      )
    );
    const score: Score = new Map([
      ["mine", myPoints],
      ["theirs", theirPoints],
    ]);

    setScore(score);

    refetchObjectives();

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
    const newGameColors = { ...gameColors };
    if (currentUser && players) {
    const allPlayersReady = (): boolean => {
        console.log("checking all ready");
        // this doesnt work anymore...
        const ready = Array.from(players.values()).every((player) => {
          if (currentUser && player.user.id === currentUser.id) {
            newGameColors.mine = player.color;
        } else {
          newGameColors.theirs = player.color!;
        }
        return player.color;
      });
        return ready;
    };
      setGameColors(newGameColors);
    setAllReady(allPlayersReady());
    }
  }, [players, currentUser]);

  return (
    <Container size="2">
      {currentUser && <p>Me: {currentUser.email}</p>}
          {players && currentUser && (
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
