import type {
  BoardPlayerCreatedDTO,
  GetBoardDTO,
  JoinBoardDTO,
} from "shared/types";
import { useState, useRef, FormEvent } from "react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import "./styles/create-board.css";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { post } from "./requests";

export const RoomItem = (props: { room: GetBoardDTO }): JSX.Element => {
  const { room } = props;
  const { currentUser } = useCurrentUser();
  const navigator = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const roomEntryForm = useRef<HTMLFormElement>(null);

  const [requestStatus, setRequestStatus] = useState<{
    error: boolean;
    reason: string;
  } | null>(null);

  const [clientError, setClientError] = useState<{
    error: boolean;
    reason: string;
  } | null>(null);

  const displayEntryForm = () => {
    if (!currentUserInPlayers(room)) setShowForm(!showForm);
  };

  const currentUserInPlayers = (room: GetBoardDTO) => {
    return (
      currentUser &&
      room?.boardPlayers &&
      room?.boardPlayers.some(
        (player: { userId: number }) => player.userId === currentUser?.id
      )
    );
  };

  async function submitHandler(
    event: FormEvent<HTMLFormElement>
  ): Promise<Response | void> {
    try {
      event.preventDefault();
      if (!roomEntryForm.current) {
        const reason = "Form is null";
        setClientError({ error: true, reason });
        throw Error(reason);
      } else if (!currentUser?.id) {
        const reason = "Please sign in before you can join a game";
        setClientError({ error: true, reason });
        throw Error(reason);
      } else {
        const formData: JoinBoardDTO = {
          password: roomEntryForm.current.password.value,
          boardId: room.id,
        };
        const response = await post<BoardPlayerCreatedDTO>(
          "/api/rooms/join",
          true,
          formData
        );

        if (response.success) {
          const { board }: BoardPlayerCreatedDTO = response.data;
          setRequestStatus({ error: false, reason: "" });
          navigator(`/play/${board.id}`);
        } else {
          setRequestStatus({
            error: true,
            reason: response.data.error,
          });
        }

        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          alignContent: "flex-start",
          justifyContent: "space-between",
          paddingInline: "5%",
        }}
        className="room-item"
      >
        <button className="btn neutral" onClick={displayEntryForm}>
          <p>{room.name}</p>
        </button>
        {currentUser &&
          room?.boardPlayers &&
          room?.boardPlayers.map((player) => {
            if (player.userId === currentUser?.id) {
              return (
                <Link to={`/play/${room.id}`} key={room.id}>
                  <h3>Play!</h3>
                </Link>
              );
            } else {
              return null;
            }
          })}
      </div>
      {showForm && (
        <form
          action=""
          ref={roomEntryForm}
          onSubmit={submitHandler}
          className="enter-room"
        >
          <label>
            <p>Password</p>
            <input type="password" name="password" />
          </label>
          <button className="btn submit" type="submit">
            Submit
          </button>
        </form>
      )}
      {requestStatus?.error && (
        <p className="error-message">
          <strong>{requestStatus.reason}</strong>
        </p>
      )}
      {clientError?.error && (
        <p className="error-message">
          <strong>{clientError.reason}</strong>
        </p>
      )}

      <hr />
    </div>
  );
};
