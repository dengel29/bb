import { Grid } from "@radix-ui/themes";
import { useState } from "react";
import { BingoCell } from "./Cell";
import "./App.css";
import { BroadcastClickArgs, Score } from "shared/types";

const objectives = Array.from({ length: 25 }, (_, i) => `Objective #${i}`);

export const Board = ({
  broadcastClick,
  score,
}: {
  broadcastClick: (args: BroadcastClickArgs) => void;
  score: Score;
}): JSX.Element => {
  const [objectivesState] = useState<string[]>(objectives);
  const handleClickBingoCell = (
    event: React.MouseEvent<HTMLButtonElement>
  ): React.MouseEvent<HTMLButtonElement, MouseEvent> => {
    const target = event.target as HTMLButtonElement;
    const cellId = Number(target.dataset.id);
    if (score.get("mine")?.has(cellId)) {
      broadcastClick({ cellId, eventType: "unclaim" });
    } else if (score.get("theirs")?.has(cellId)) {
      return event;
    } else {
      broadcastClick({ cellId, eventType: "claim" });
    }
    return event;
  };

  const determineOwner = (cellId: number): string => {
    // the ! at the end of these get calls tells Typescript they are NOT going to be undefined
    const myScore: Set<number> = score.get("mine")!;
    const theirScore: Set<number> = score.get("theirs")!;

    let owner;
    if (myScore && myScore.has(cellId)) {
      owner = "cell__mine";
    } else if (theirScore && theirScore.has(cellId)) {
      owner = "cell__theirs";
    } else {
      owner = "cell__noOwner";
    }
    return owner;
  };

  return (
    <>
      <Grid columns={"5"} rows={"5"}>
        {objectivesState.map((o, i) => {
          return (
            <BingoCell
              cellId={i}
              text={o}
              handleClick={handleClickBingoCell}
              owner={determineOwner(i)}
              key={i + o}
            />
          );
        })}
      </Grid>
    </>
  );
};
