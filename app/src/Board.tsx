import { Grid } from "@radix-ui/themes";
import { useRef, useCallback } from "react";
import { BingoCell } from "./Cell";
import "./App.css";
import "./styles/board.css";
import type {
  BoardObjectivesDTO,
  BroadcastClickArgs,
  Score,
} from "shared/types";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";

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
  gameColors: { mine: string | null; theirs: string | null };
}): JSX.Element => {
  const boardRef = useRef<HTMLDivElement>(null);
  const onUpdate = useCallback(({ x, y, scale }) => {
    const { current: board } = boardRef;

    if (board) {
      const value = make3dTransformValue({ x, y, scale });

      board.style.setProperty("transform", value);
    }
  }, []);

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

  const sharedStyle = `linear-gradient(0.35turn, var(--${gameColors.mine}-7) 0 50%, var(--${gameColors.theirs}-7) 50% 100%)`;

  const determineOwner = (cellId: number): string => {
    // the ! at the end of these get calls tells Typescript they are NOT going to be undefined
    const myScore: Set<number> = score.get("mine")!;
    const theirScore: Set<number> = score.get("theirs")!;

    let owner;
    if (
      myScore &&
      myScore.has(cellId) &&
      theirScore &&
      theirScore.has(cellId)
    ) {
      console.log(owner);
      owner = "shared";
    } else if (myScore && myScore.has(cellId)) {
      owner = `bg-${gameColors.mine}`;
    } else if (theirScore && theirScore.has(cellId)) {
      owner = `bg-${gameColors.theirs}`;
    } else {
      owner = "cell__noOwner";
    }
    return owner;
  };

  return (
    <div>
      {allReady && objectives && (
        <QuickPinchZoom
          onUpdate={onUpdate}
          zoomOutFactor={1}
          tapZoomFactor={0}
          minZoom={0.9}
          verticalPadding={20}
          horizontalPadding={20}
        >
          <Grid
            columns={"5"}
            rows={"5"}
            className={"board-container"}
            ref={boardRef}
          >
            {objectives &&
              objectives.map((o) => {
                return (
                  <BingoCell
                    cellId={o.objectiveId}
                    countable={o.objective.countable || false}
                    countLimit={o.objective.countLimit || undefined}
                    text={o.objective.displayName}
                    handleClick={handleClickBingoCell}
                    owner={determineOwner(o.objectiveId)}
                    key={o.objectiveId}
                    sharedStyle={
                      determineOwner(o.objectiveId) === "shared"
                        ? sharedStyle
                        : ""
                    }
                  />
                );
              })}
          </Grid>
        </QuickPinchZoom>
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
    </div>
  );
};
