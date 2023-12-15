import type { GetBoardDTO } from "shared/types";
import { RoomItem } from "./RoomItem";
import "./styles/create-board.css";

export const RoomList = ({
  rooms,
}: {
  rooms: GetBoardDTO[] | undefined;
}): JSX.Element => {
  return (
    <>
      {rooms && (
        <div className="games-list__container">
          <h2>All Games</h2>

          <div>
            <p>No games on today, create one and invite your friends</p>
          </div>

          {rooms &&
            rooms.map((room) => {
              return <RoomItem room={room} key={room.id} />;
            })}
        </div>
      )}
    </>
  );
};
