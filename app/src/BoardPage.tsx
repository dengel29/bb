import { Container } from "@radix-ui/themes";
import "./styles/board.css";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
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
import { socketEmit, socketOn } from "./socket-actions";
import { get, isSuccessResponse } from "./requests";
import { Link } from "react-router-dom";

export const BoardPage = () => {
  const { currentUser, loading, error } = useCurrentUser();
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [socketError, setError] = useState<SocketPayload["error"] | null>(null);
  const initialScore: Score = new Map([
    ["mine", new Set()],
    ["theirs", new Set()],
  ]);
  const [selectedColor, setSelectedColor] = useState<string>("white");
  const [, setMyColor] = useState<string | null>(null);
  const [gameColors, setGameColors] = useState<{
    mine: string | null;
    theirs: string | null;
  }>({ mine: null, theirs: null });

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
  const getObjectives = async (): Promise<BoardObjectivesDTO[] | Error> => {
    const response = await get<BoardObjectivesDTO[]>(
      `/api/rooms/objectives?board=${boardId}`,
      true
    );
    if (isSuccessResponse(response)) {
      return response.data;
    } else {
      throw new Error(response.data.error);
    }
  };

  const {
    data: objectives,
    refetch: refetchObjectives,
    status: objectivesStatus,
  } = useQuery({
    queryKey: ["objectives", boardId],
    queryFn: getObjectives,
  });

  const getPlayers = async (): Promise<PlayerMap | undefined> => {
    const boardId = window.location.pathname.split("/")[2];
    const response = await get<GetBoardPlayerDTO[]>(
      `/api/rooms/players?board=${boardId}`,
      true
    );

    if (isSuccessResponse(response)) {
      const playersMap: PlayerMap = new Map(
        response.data.map((player: GetBoardPlayerDTO) => [
          player.socketId!,
          player,
        ])
      );
      return playersMap;
    } else {
      return;
    }
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

  socketOn<"objectives:created">("objectives:created", () => {
    refetchObjectives();
  });

  socketOn<"error">("error", (payload) => {
    setError(payload);
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
    if (currentUser) {
      const payload: SocketPayload["cell:toggled"] = {
        cellId,
        objectiveId: cellId,
        eventType,
        boardId: window.location.pathname.split("/")[2],
        userId: currentUser?.id,
      };
      socketEmit("cell:clicked", payload);
    }
  };
  // on("player:ready", (payload: PossiblePayloads) => {
  //   console.log(payload);
  // });

  socketOn<"player:joined">("player:joined", (payload): void => {
    if (!players || players instanceof Error) {
      return;
    }
    const { newPlayer, socketId } = payload;
    // make sure we aren't adding same user twice
    const duplicatePlayer = Array.from(players.values()).find(
      (player) => player.user.id === newPlayer.user.id
    );

    if (duplicatePlayer && duplicatePlayer.socketId) {
      players.delete(duplicatePlayer.socketId);
    }

    players.set(socketId, newPlayer);
    refetchPlayers();
  });

  socketOn<"player:left">("player:left", (/**payload*/) => {
    // const { socketId } = payload;
    // console.log(`${players?.get(socketId)?.user} has left the room`);
    if (!players) {
      return;
    }
    // if we want to indicate client-side who is online or not, this is where we would do it
    // right now unnecessary but the pseudocode looks like:
    // create some client-side state onlinePlayers derived(?) but separate from players
    // toggle onlinePlayers state
    // grey out the name or color or add other indicator
  });

  socketOn<"player:waiting">("player:waiting", async (payload) => {
    // if (!players) return;
    await refetchPlayers();
    if (!players || players instanceof Error) return;
    const { userId, socketId, color } = payload;

    const player = players.get(socketId);

    const newColors = new Map(allColors);
    const iterator = newColors.entries();
    const colorsToDelete = new Set<string>([color]);

    // set player's new color
    if (player) {
      player.color = color;
    }

    // add to in-memory set of colors to delete from available colors
    Array.from(players.values()).forEach((p) => {
      if (p?.color && currentUser && currentUser.id === Number(userId))
        colorsToDelete.add(p.color);
    });

    // delete chosen color from available colors
    for (let i = 0; i < availableColors.size; i++) {
      const [_key, value] = iterator.next().value;
      if (colorsToDelete.has(value)) {
        newColors.delete(_key);
      }
    }
    setAvailableColors(newColors);
  });

  socketOn<"cell:toggled">("cell:toggled", (payload) => {
    const { userId, cellId, eventType } = payload;
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

    // toggle off last marked then on for newly marked
    const lastMarked = document.querySelector(`#last-marked`);
    if (lastMarked) lastMarked.id = "";
    const newMarked = document.querySelector(`[data-id="${cellId}"]`);
    if (newMarked) {
      console.log("new");
      newMarked.id = "last-marked";
    }
  });

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
      objectives instanceof Error ||
      players instanceof Error ||
      !players ||
      !currentUser ||
      playersStatus === "error" ||
      objectivesStatus !== "success" ||
      objectives instanceof Error
    ) {
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
  }, [
    objectives,
    players,
    currentUser,
    objectivesStatus,
    playersStatus,
    refetchObjectives,
  ]);

  // emit room joined when joining a room
  useEffect(() => {
    if (currentUser && !loading && !error) {
      const payload: SocketPayload["room:joined"] = {
        boardId: window.location.pathname.split("/")[2],
        player: {
          user: {
            email: currentUser?.email,
            id: currentUser?.id,
            username: null, //currentUser?.username,
          },
        },
      };
      socketEmit("room:joined", payload);
    }
  }, [loading, currentUser, error]);

  const [allReady, setAllReady] = useState<boolean>(false);

  // check if all players ready
  useEffect(() => {
    const newGameColors = { ...gameColors };
    if (currentUser && players && !(players instanceof Error)) {
      const allPlayersReady = (): boolean => {
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
      setAllReady(allPlayersReady());
      setGameColors(newGameColors);
    }
  }, [players, currentUser]);

  return (
    <>
      {socketError && (
        <div>
          <h3>{socketError.message}</h3>
          Go back to <Link to={`${socketError.redirectPath}`}>this page</Link>,
          and {socketError.suggestion}
        </div>
      )}
      {players && currentUser && (
        <ConnectionState players={players} isConnected={isConnected} />
      )}
      {!socketError && !(players instanceof Error) && !allReady && (
        <Container size="2">
          <p>Pick a color and let the other players know you're ready</p>
          {!allReady && (
            <CirclePicker
              onChange={(_color, event) => {
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
        </Container>
      )}
      {currentUser && objectives && !(objectives instanceof Error) && (
        <Board
          broadcastClick={broadcastClick}
          score={score}
          allReady={allReady}
          generateBoard={handleGameStart}
          objectives={objectives}
          gameColors={gameColors}
        ></Board>
      )}
    </>
  );
};
