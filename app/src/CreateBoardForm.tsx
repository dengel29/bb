import { FormEvent, useRef, useState } from "react";
import { CreateBoardDTO, GetBoardDTO } from "shared/types";
import "./styles/create-board.css";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { QueryObserverResult } from "@tanstack/react-query";
import { domain } from "./domain";

export const CreateBoardForm = ({
  refetchRooms,
}: {
  refetchRooms: () => ReturnType<
    () => Promise<QueryObserverResult<GetBoardDTO[]>>
  >;
}): JSX.Element => {
  // TODO: user req.user instead of using useCurrentUser hook on client
  const { currentUser } = useCurrentUser();
  const [requestStatus, setRequestStatus] = useState<{
    error: boolean;
    reason: string;
  } | null>(null);
  const [clientError, setClientError] = useState<{
    error: boolean;
    reason: string;
  } | null>(null);
  const createBoardForm = useRef<HTMLFormElement>(null);
  async function submitHandler(
    event: FormEvent<HTMLFormElement>
  ): Promise<Response | void> {
    try {
      console.log(currentUser);
      event.preventDefault();
      if (!createBoardForm.current) {
        const reason = "Form is null";
        setClientError({ error: true, reason });
        throw Error(reason);
      } else if (!currentUser?.id) {
        const reason = "Please sign in to create a game";
        setClientError({ error: true, reason });
        throw Error(reason);
      } else {
        const formData: CreateBoardDTO = {
          createdById: currentUser.id,
          name: createBoardForm.current.roomName.value,
          password: createBoardForm.current.roomPassword.value,
          gameType: createBoardForm.current.gameType.value,
          // seed: createBoardForm.current.seed.value,
        };

        const response = await fetch(`${domain}/api/create-room`, {
          method: "POST",
          body: JSON.stringify(formData),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setRequestStatus({ error: false, reason: "" });
        } else {
          setRequestStatus({
            error: true,
            reason: response.statusText,
          });
        }

        refetchRooms();
        return response;
      }
    } catch (error) {
      console.log("error happened", error);
    }
  }

  return (
    <div className="create-form__container">
      <h2>Create a new game</h2>
      <form
        ref={createBoardForm}
        onSubmit={submitHandler}
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <label>
          <p>Room Name</p>
          <input type="text" name="roomName" required />
        </label>
        <label>
          Room Password
          <input type="text" name="roomPassword" required />
        </label>

        <label>
          Game Type
          <select name="gameType" id="" required>
            <option value="LOCKOUT">Lockout</option>
            <option value="STANDARD">Standard</option>
            <option value="BLACKOUT">Blackout</option>
          </select>
          <button type="submit">Submit</button>
        </label>
      </form>
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
    </div>
  );
};
