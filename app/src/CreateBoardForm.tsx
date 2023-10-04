import { FormEvent, useRef } from "react";
import { CreateBoardDTO } from "shared/types";

export const CreateBoardForm = (): JSX.Element => {
  const user = {
    id: 1,
  };
  const createBoardForm = useRef<HTMLFormElement>(null);

  async function submitHandler(
    event: FormEvent<HTMLFormElement>
  ): Promise<Response | void> {
    try {
      event.preventDefault();
      if (!createBoardForm.current) {
        throw Error("Form is null");
      } else {
        const formData: CreateBoardDTO = {
          createdById: user.id,
          name: createBoardForm.current.roomName.value,
          password: createBoardForm.current.roomPassword.value,
          gameType: createBoardForm.current.gameType.value,
          // seed: createBoardForm.current.seed.value,
        };

        const response = await fetch("http://localhost:3000/api/create-room", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log(response.status);

        return response;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div
      style={{
        maxWidth: "70%",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
      }}
    >
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
          Room Name
          <input type="text" name="roomName" required />
        </label>
        <label>
          Room Password
          <input type="text" name="roomPassword" required />
        </label>
        {/* <label>
          Seed
          <small>(this can be autogenerated)</small>
          <input type="number" name="seed" />
        </label> */}

        <select name="gameType" id="" required>
          <option value="LOCKOUT">Lockout</option>
          <option value="STANDARD">Standard</option>
          <option value="BLACKOUT">Blackout</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
