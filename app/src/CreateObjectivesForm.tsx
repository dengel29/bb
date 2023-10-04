import { FormEvent, useEffect, useRef, useState } from "react";
import { CreateObjectiveDTO } from "shared/types";

const ObjectiveInputSet = ({
  setId,
  removeItem,
}: {
  setId: number;
  removeItem: (itemId: number) => void;
}): React.ReactElement => {
  const countableCheckboxRef = useRef<HTMLInputElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const [isCountable, setIsCountable] = useState(false);

  const updateCountable = () => {
    setIsCountable(!isCountable);
  };

  useEffect(() => {
    firstInput.current?.focus();
  }, []);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "3%",
        }}
        key={setId}
      >
        <button onClick={() => removeItem(setId)}>Delete Objective</button>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "10%",
          }}
        >
          Display Name
          <input
            type="text"
            name={`displayName${setId}`}
            required
            ref={firstInput}
          />
          <br />
          <small>What will be shown in the cell</small>
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "10%",
          }}
        >
          Countable
          <input
            ref={countableCheckboxRef}
            type="checkbox"
            name={`countable${setId}`}
            defaultChecked={false}
            onChange={() => updateCountable()}
          />
          <small>
            e.g. Visit <strong>5</strong> 7-11s
          </small>
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Count Limit
          <input
            type="number"
            name={`countLimit${setId}`}
            disabled={!isCountable}
          />
          <small>How many times a player must execute the task</small>
        </label>
      </div>
      <hr style={{ width: "100%" }} />
    </>
  );
};

export const CreateObjectivesForm = (): JSX.Element => {
  const user = {
    id: 1,
  };
  const createObjectivesForm = useRef<HTMLFormElement>(null);
  const [objectiveIds, setObjectiveIds] = useState<Set<number>>(new Set());

  const removeObjective = (setId: number) => {
    const newObjectives = new Set(objectiveIds);
    newObjectives.delete(setId);
    setObjectiveIds(new Set(newObjectives));
  };

  async function submitHandler(
    event: FormEvent<HTMLFormElement>
  ): Promise<Response | void> {
    try {
      event.preventDefault();
      if (!createObjectivesForm.current) {
        throw Error("Form is null");
      } else {
        const objectives = [];
        const form = createObjectivesForm.current;
        for (let i = 0; i < objectiveIds.size; i++) {
          const objective: CreateObjectiveDTO = {
            displayName: form[`displayName${i}`].value,
            countable: form[`countable${i}`].checked,
            countLimit:
              form[`countable${i}`].checked && form[`countLimit${i}`].value
                ? Number(form[`countLimit${i}`].value)
                : null,
            creatorId: user.id,
          };

          objectives.push(objective);
        }

        console.log(objectives);

        // console.log(formData);

        const response = await fetch(
          "http://localhost:3000/api/create-objectives",
          {
            method: "POST",
            body: JSON.stringify(objectives),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        margin: "auto",
      }}
    >
      <form
        ref={createObjectivesForm}
        onSubmit={submitHandler}
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {[...objectiveIds].map((inputSetId) => {
          return (
            <ObjectiveInputSet
              key={inputSetId}
              setId={inputSetId}
              removeItem={removeObjective}
            />
          );
        })}
        <button
          type="button"
          onClick={() => {
            console.log("what");
            const newObjectiveIds = new Set(objectiveIds).add(
              objectiveIds.size
            );
            setObjectiveIds(newObjectiveIds);
          }}
        >
          +
        </button>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
