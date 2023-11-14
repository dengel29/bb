import { useState, useEffect } from "react";
import { MyGamesDTO } from "shared/types";
import { PageContainer } from "./PageContainer";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Link } from "react-router-dom";
export const ProfilePage = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();
  const [myGames, setMyGames] = useState<MyGamesDTO[]>([]);

  useEffect(() => {
    const getMyGames = async (): Promise<MyGamesDTO[]> => {
      const response = await fetch(
        `http://localhost:3000/api/games?userId=${currentUser?.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return await response.json();
    };
    if (currentUser?.id && !loading) {
      getMyGames().then((games: MyGamesDTO[]) => {
        setMyGames(games);
      });
    }
  }, [currentUser, loading]);

  function dateDiff(
    earlierDate: Date,
    laterDate: Date
  ):
    | { diff: number; ms: number; s: number; m: number; h: number; d: number }
    | false {
    const diff = earlierDate.valueOf() - laterDate.valueOf();
    return isNaN(diff)
      ? false
      : {
          diff: diff,
          ms: Math.floor(diff % 1000),
          s: Math.floor((diff / 1000) % 60),
          m: Math.floor((diff / 60000) % 60),
          h: Math.floor((diff / 3600000) % 24),
          d: Math.floor(diff / 86400000),
        };
  }
  return (
    <PageContainer title={"Profile"}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "baseline",
        }}
      >
        <h1>It's my life |</h1>
        <h2>don't u forget</h2>
      </div>
      <hr />
      <h1>My games</h1>
      {currentUser &&
        myGames.map((game) => {
          const { diff, ms, s, m, h, d } = dateDiff(
            new Date(),
            new Date(game.createdAt)
          );
          return (
            <div>
              <Link to={`/play/${game.id}`}>
                {game.name} | Created {String(d)} days {String(h)} hours ago by
                {": "}
                {game.createdBy.email}
              </Link>
              <br />
              <br />
            </div>
          );
        })}
    </PageContainer>
  );
};
