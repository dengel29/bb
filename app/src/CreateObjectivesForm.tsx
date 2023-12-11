import { FormEvent, useEffect, useRef, useState } from "react";
import { CreateObjectiveDTO } from "shared/types";
import { PageContainer } from "./PageContainer";
import { useCurrentUser } from "./hooks/useCurrentUser";
import toast from "react-hot-toast";
import "./styles/objectives.css";
import { domain } from "./domain";

const ObjectiveInputSet = ({
  setId,
  removeItem,
}: {
  setId: number;
  removeItem: (itemId: number) => void;
}): React.ReactElement => {
  const countableCheckboxRef = useRef<HTMLInputElement>(null);
  const countLimitRef = useRef<HTMLInputElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const [isCountable, setIsCountable] = useState(false);

  const updateCountable = () => {
    const numberMatch = firstInput.current?.value.match(/\d+/);
    if (
      numberMatch &&
      isCountable === false &&
      firstInput?.current?.value.match(/\d+/) &&
      countLimitRef.current
    ) {
      countLimitRef.current.value = numberMatch[0];
    }
    setIsCountable(!isCountable);
  };

  useEffect(() => {
    firstInput.current?.focus();
  }, []);

  return (
    <div>
      <div className="objectives-list__container">
        <div key={setId} className="objective-item__container">
          <button onClick={() => removeItem(setId)} className="delete btn">
            Delete
          </button>
          <label>
            Display Name
            <input
              type="text"
              name={`displayName${setId}`}
              required
              ref={firstInput}
            />
            <small>What will be shown in the cell</small>
          </label>
          <label>
            Countable
            <input
              ref={countableCheckboxRef}
              type="checkbox"
              name={`countable${setId}`}
              defaultChecked={false}
              onChange={() => updateCountable()}
            />
            <small>
              e.g. Visit <strong>4</strong> churches
            </small>
          </label>
          <label>
            Count Limit
            <input
              type="number"
              min={2}
              name={`countLimit${setId}`}
              disabled={!isCountable}
              ref={countLimitRef}
            />
            <small>How many times a player must execute the task</small>
          </label>
        </div>
        <br />
      </div>
    </div>
  );
};

export const CreateObjectivesForm = (): JSX.Element => {
  const { currentUser } = useCurrentUser();
  const createObjectivesForm = useRef<HTMLFormElement>(null);
  const [objectiveIds, setObjectiveIds] = useState<Set<number>>(new Set([0]));

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
      if (!createObjectivesForm.current || !currentUser) {
        throw Error("Form is null or current user ain't here");
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
            creatorId: currentUser.id,
          };

          objectives.push(objective);
        }

        // console.log(formData);
        const toastId = toast.loading("Submitting...");
        const response = await fetch(`${domain}/api/create-objectives`, {
          method: "POST",
          body: JSON.stringify(objectives),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // TODO: show success or error toast here
        // 200 is a success
        // error message should be sent with server response
        if (response.ok) {
          toast.dismiss(toastId);
          toast.success(`Nice, submission successful`, {
            position: "bottom-center",
            duration: 3000,
          });
        } else {
          toast.dismiss(toastId);
          toast.error("Uh oh, something went wrong");
        }
        return response;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <PageContainer title={"Create Tasks"}>
      <h1>Create Tasks For Taiwan</h1>
      <div>
        <form
          ref={createObjectivesForm}
          onSubmit={submitHandler}
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div className="objectives-list__scroll">
            {[...objectiveIds].map((inputSetId) => {
              return (
                <ObjectiveInputSet
                  key={inputSetId}
                  setId={inputSetId}
                  removeItem={removeObjective}
                />
              );
            })}
          </div>
          <br />
          <button
            type="button"
            className="btn neutral"
            onClick={() => {
              let value;
              if (objectiveIds.size === 0) {
                value = 0;
              } else {
                for (value of objectiveIds);
              }
              const newObjectiveIds = new Set(objectiveIds).add(value! + 1);
              setObjectiveIds(newObjectiveIds);
            }}
          >
            Add another task
          </button>
          <button type="submit" className="btn submit">
            Submit {objectiveIds.size} Task
            {objectiveIds.size > 1 ? "s" : ""}
          </button>
        </form>
      </div>
    </PageContainer>
  );
};
