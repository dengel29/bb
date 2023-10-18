import { useState, useEffect } from "react";
import { RoomItem } from "./RoomItem";
import "./styles/create-board.css";
import { GetBoardDTO } from "shared/types";

const getRecentRooms = async () =>
  await fetch("http://localhost:3000/api/get-rooms", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

export const RoomList = (): JSX.Element => {
  const [rooms, setRooms] = useState<GetBoardDTO[] | null>(null);
  useEffect(() => {
    getRecentRooms().then((response: Response) => {
      response.json().then((rooms) => {
        setRooms(rooms);
      });
    });
  }, []);
  return (
    <div className="games-list__container">
      <h2>All Games</h2>
      {rooms?.length === 0 && (
        <div>
          <p>No games on today, create one and invite your friends</p>
        </div>
      )}
      {rooms &&
        rooms.map((room) => {
          return <RoomItem room={room} key={room.id} />;
        })}
    </div>
  );
};
