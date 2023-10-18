import { BoardPlayerCreatedDTO, GetBoardDTO, JoinBoardDTO } from "shared/types";
import { useState, useRef, FormEvent } from "react";
import { useCurrentUser } from "./hooks/useCurrentUser";
import "./styles/create-board.css";
import { useNavigate } from "react-router-dom";

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
    setShowForm(!showForm);
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
        const reason = "Please sign in to create a game";
        setClientError({ error: true, reason });
        throw Error(reason);
      } else {
        const formData: JoinBoardDTO = {
          password: roomEntryForm.current.password.value,
          boardId: room.id,
        };
        const response = await fetch("http://localhost:3000/api/rooms/join", {
          method: "POST",
          body: JSON.stringify(formData),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const { board }: BoardPlayerCreatedDTO = await response.json();
          setRequestStatus({ error: false, reason: "" });
          navigator(`/play/${board.id}`);
        } else {
          setRequestStatus({
            error: true,
            reason: response.statusText,
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
      <button onClick={displayEntryForm}>
        <p>{room.name}</p>
      </button>
      {showForm && (
        <form
          action=""
          ref={roomEntryForm}
          style={{ display: "flex", alignItems: "center" }}
          onSubmit={submitHandler}
        >
          <label
            style={{
              width: "50%",
              display: "flex",
              height: "30px",
              alignItems: "center",
              justifyContent: "space-between",
              marginRight: "auto",
            }}
          >
            <p>Password</p>
            <input type="password" name="password" />
          </label>
          <button type="submit">Submit</button>
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
