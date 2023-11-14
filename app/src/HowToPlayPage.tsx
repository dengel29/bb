import { useState } from "react";
import { Score } from "shared/types";
import { BingoCell } from "./Cell";
import { PageContainer } from "./PageContainer";
import "./styles/board.css";

export function HowToPlayPage() {
  const [score, setScore] = useState<Score>(
    new Map([
      ["mine", new Set([])],
      ["theirs", new Set([3, 4])],
    ])
  );

  const gameColors = { mine: "green", theirs: "orange" };

  const determineOwner = (cellId: number): string => {
    const myScore: Set<number> = score.get("mine")!;
    const theirScore: Set<number> = score.get("theirs")!;

    let owner;
    if (
      myScore &&
      myScore.has(cellId) &&
      theirScore &&
      theirScore.has(cellId)
    ) {
      owner = `shared`;
    } else if (myScore && myScore.has(cellId)) {
      owner = `bg-${gameColors.mine}`;
    } else if (theirScore && theirScore.has(cellId)) {
      owner = `bg-${gameColors.theirs}`;
    } else {
      owner = "cell__noOwner";
    }
    return owner;
  };
  const handleTutorialClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    type: "normal" | "countable" | "claimed-lockout" | "claimed-standard"
  ) => {
    console.log(event);
    // console.log(type);
    switch (type) {
      case "normal":
        normalClick(event);
        break;
      case "countable":
        countableClick(event);
        break;
      case "claimed-lockout":
        claimedLockoutClick(event);
        break;
      case "claimed-standard":
        claimedStandardClick(event);
        break;
      default:
        break;
    }
  };

  const sharedStyle = `linear-gradient(0.35turn, var(--${gameColors.mine}-7) 0 50%, var(--${gameColors.theirs}-7) 50% 100%)`;

  function incrementScore(event: React.MouseEvent<HTMLButtonElement>) {
    const newScore = new Map(score);
    const target = event.target as HTMLButtonElement;
    const cellId = Number(target.dataset.id);
    const myScore = newScore.get("mine")!;
    if (myScore.has(cellId)) {
      myScore.delete(cellId);
    } else {
      myScore.add(cellId);
    }
    setScore(newScore);
  }

  function normalClick(event: React.MouseEvent<HTMLButtonElement>) {
    incrementScore(event);
  }

  function countableClick(event: React.MouseEvent<HTMLButtonElement>) {
    incrementScore(event);
  }

  function claimedLockoutClick(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(event);
    throw new Error("Function not implemented.");
  }

  function claimedStandardClick(event: React.MouseEvent<HTMLButtonElement>) {
    incrementScore(event);
  }

  function diag(index: number) {
    //1,5,7,9,13,17,19,21,25
    const lr = [0, 6, 12, 18, 24];
    const rl = [4, 8, 12, 16, 20];

    if (index === 12) {
      return "lr rl";
    } else if (lr.some((i) => i === index)) {
      return "lr";
    } else if (rl.some((i) => i === index)) {
      return "rl";
    } else {
      return "";
    }
  }

  return (
    <PageContainer title={"How To Play"}>
      <section className="how-to__container">
        <h1>How To Bingo</h1>
        <p>
          Bingo is played on a 5-by-5 board. Each square in the grid has an
          objective, something like "Cross a bridge", "Visit 5 churches", "Ride
          the bus one stop with your bike". The goal is to complete an unbroken
          line - vertical, horizontal, or diagonal – of 5 squares, like below.
        </p>

        <div className="example-boards__container">
          <div className="board grid-25 cols">
            {Array.from(Array(25).keys()).map((i) => {
              return (
                <div
                  className="cell"
                  style={{ "--row": i } as React.CSSProperties}
                  key={i}
                ></div>
              );
            })}
          </div>
          <div className="board grid-25 rows">
            {Array.from(Array(25).keys()).map((i) => {
              return (
                <div
                  className="cell"
                  style={
                    {
                      "--row": Math.abs((i % 5) - i) / 5 + 1,
                    } as React.CSSProperties
                  }
                  key={i}
                ></div>
              );
            })}
          </div>
          <div className="board grid-25 diag">
            {Array.from(Array(25).keys()).map((i) => {
              return (
                <div
                  className={`cell ${diag(i)}`}
                  style={
                    {
                      "--cell": i,
                    } as React.CSSProperties
                  }
                  key={i}
                ></div>
              );
            })}
          </div>
        </div>

        <h2>Types of Games</h2>
        <p>
          There are different kinds of squares that you'll encounter on a Bingo
          board, that may act slightly differently based on what kind of game
          you're playing.
        </p>
        <p>
          There are 3 basic gametypes you can choose when creating a bingo game:
          <strong> Standard</strong>, <strong> Lockout</strong>, and{" "}
          <strong>Blackout</strong>.
        </p>
        <p>
          <strong>Standard</strong> is the most straightforward: any squares can
          be claimed by any player until someone gets a bingo. In other words,
          if your opponent marks a square, you can still complete that objective
          and mark that square as well.
        </p>
        <p>
          <strong>Lockout</strong> is slightly different: once a square is
          marked, no other player may mark it. A bingo <em>can</em> win here,
          but there is also the possibility that a bingo will be made
          unachievable for both players, in which case whichever player claims
          the majority of squares then wins.
        </p>
        <p>
          In other words, first to bingo or first to 13 squares. As you can
          imagine, Lockout is strategically the most interesting and therefore
          the one I recommend.
        </p>
        <p>
          <strong>Blackout</strong> is not for the faint of heart: same rules as
          standard – all squares can be marked, whether or not your opponent has
          already marked them. However, to win, you must mark{" "}
          <em>every single square on the board.</em>
        </p>
        <h2>Objective Types + Squares</h2>
        <p>
          The board you receive will be a collection of 25 tasks, generated and
          arranged randomly from a pool of tasks. There are different kinds of
          tasks, and depending on what kind of game you're playing the squares
          may respond differently to interaction, so below is a guide.
        </p>
      </section>
      <section className="how-to__container">
        <h1>Square Types</h1>
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "calc(100vw/10)",
            justifyContent: "space-between",
          }}
          className="how-to__item"
        >
          <BingoCell
            cellId={1}
            countable={false}
            handleClick={(event) => handleTutorialClick(event, "normal")}
            text={`I'm a normal unclaimed square. \n Click me and I'll change to your color`}
            owner={determineOwner(1)}
            sharedStyle={determineOwner(1) === "shared" ? sharedStyle : ""}
          />
          <section className="how-to__description">
            <h2>Standard Square</h2>
            <p>
              At the beginning of a game, all squares are "unclaimed" and are
              this off-white color.
            </p>
            <p>
              When you complete the task described in the square, tap the square
              and it will change to your color, indicating that you've claimed
              it.
            </p>
            <p>
              If you've made a mistake, click it again to unmark the square.
              Your opponent will see the squares update in real-time.
            </p>
          </section>
        </div>
        <hr />
        <br />

        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "calc(100vw/10)",
            justifyContent: "space-between",
          }}
          className="how-to__item"
        >
          <BingoCell
            cellId={2}
            countable={true}
            countLimit={4}
            handleClick={(event) => handleTutorialClick(event, "countable")}
            text="Visit 4 churches"
            owner={determineOwner(2)}
            sharedStyle={determineOwner(2) === "shared" ? sharedStyle : ""}
          />
          <section className="how-to__description">
            <h2>Countable Square</h2>
            <p>Some tasks have 'countable' tasks, like the one here.</p>
            <p>
              When you click it, a number in the bottom right will increment.
              This is just for your convenience, your opponent won't see it.
              When you reach the objective count, you will automatically claim
              the square.
            </p>
            <p>Try tapping the square 4 times.</p>
          </section>
        </div>
        <hr />
        <br />
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "calc(100vw/10)",
            justifyContent: "space-between",
          }}
          className="how-to__item"
        >
          <BingoCell
            cellId={3}
            countable={false}
            handleClick={(event) =>
              handleTutorialClick(event, "claimed-lockout")
            }
            text="Cross a bridge"
            owner={determineOwner(3)}
            sharedStyle={determineOwner(3) === "shared" ? sharedStyle : ""}
          />
          <section className="how-to__description">
            <h2>Claimed Square (Lockout)</h2>
            <p>
              When you're playing a "lockout" game, the first player to claim
              the square prevents anyone else from claiming it. This square is
              already claimed by your opponent, if you tap it nothing will
              happen.
            </p>
            <p>Try tapping it, nothing will happen.</p>
          </section>
        </div>
        <hr />
        <br />
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: "calc(100vw/10)",
            justifyContent: "space-between",
          }}
          className="how-to__item"
        >
          <BingoCell
            cellId={4}
            countable={false}
            handleClick={(event) =>
              handleTutorialClick(event, "claimed-standard")
            }
            text="Standard, non-lockout games, are coming soon"
            owner={determineOwner(4)}
            sharedStyle={determineOwner(4) === "shared" ? sharedStyle : ""}
          />
          <section className="how-to__description">
            <h2>Claimed Square (Standard or Blackout)</h2>
            <p>
              When you're playing a "standard" or "blackout" game, 2 players can
              claim the same square. Here, your opponent has already marked the
              square, but you can still claim it too.
            </p>
            <p>
              Tap the square and observe its shared nature. These can also be
              tapped again to "unclaim" if you've made a mistake.
            </p>
          </section>
        </div>
      </section>
      <section className="how-to__container">
        <h1>Current Limitations + Roadmap</h1>
        <p>
          Right now, Bingo is a one-on-one thing. I've got plans for bingo going
          into the future, but right now it has some limitations. Posting a
          roadmap here on the website is the first item on my roadmap 😜
        </p>
        <p>
          Thanks for your patience, and for any suggestions or feedback please
          send it to dan[at]dngl.cc
        </p>
      </section>
    </PageContainer>
  );
}
