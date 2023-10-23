import { Grid } from "@radix-ui/themes";
// import { useState } from "react";
import { BingoCell } from "./Cell";
import "./App.css";
import "./styles/board.css";
import { BoardObjectivesDTO, BroadcastClickArgs, Score } from "shared/types";

export const Board = ({
  broadcastClick,
  score,
  allReady,
  generateBoard,
  objectives,
  gameColors,
}: {
  broadcastClick: (args: BroadcastClickArgs) => void;
  score: Score;
  allReady: boolean;
  generateBoard: () => void;
  objectives: BoardObjectivesDTO[];
  gameColors: { mine: string; theirs: string };
}): JSX.Element => {
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
      owner = `bg-${gameColors.mine}`;
    } else if (theirScore && theirScore.has(cellId)) {
      owner = `bg-${gameColors.theirs}`;
    } else {
      owner = "cell__noOwner";
    }
    return owner;
  };

  return (
    <>
      {allReady && objectives && (
        <Grid columns={"5"} rows={"5"}>
          {objectives &&
            objectives.map((o, i) => {
              return (
                <BingoCell
                  cellId={i}
                  text={o.objective.displayName}
                  handleClick={handleClickBingoCell}
                  owner={determineOwner(i)}
                  key={o.objectiveId}
                />
              );
            })}
        </Grid>
      )}
      {allReady && objectives.length < 1 && (
        <Grid
          columns={"1"}
          rows={"1"}
          style={{
            height: "70vw",
            width: "70vw",
            margin: "0 auto",
            border: "1px solid green",
          }}
        >
          <div style={{ placeSelf: "center" }}>
            <button onClick={generateBoard}>Reveal Board!</button>
          </div>
        </Grid>
      )}
    </>
  );
};
