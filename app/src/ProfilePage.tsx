import { useState, useEffect } from "react";
import { MyGamesDTO } from "shared/types";
import { PageContainer } from "./PageContainer";
import { LocationGrabber } from "./LocationGrabber";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Link } from "react-router-dom";
export const ProfilePage = (): JSX.Element => {
  const domain =
    process.env.APP_ENV === "prod"
      ? "https://bingo-server-gylc.onrender.com"
      : "http://localhost:3000";

  const { currentUser, loading } = useCurrentUser();
  const [myGames, setMyGames] = useState<MyGamesDTO[]>([]);

  useEffect(() => {
    const getMyGames = async (): Promise<MyGamesDTO[]> => {
      const response = await fetch(
        `${domain}/api/games?userId=${currentUser?.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();
      return data;
    };
    if (currentUser?.id && !loading) {
      getMyGames().then((games: MyGamesDTO[]) => {
        setMyGames(games);
      });
    }
  }, [currentUser, loading, domain]);

  function isDiffNan(earlierDate: Date, laterDate: Date): boolean {
    const diff = earlierDate.valueOf() - laterDate.valueOf();
    return isNaN(diff);
  }

  function formatDateDiff(
    earlierDate: Date,
    laterDate: Date
  ): {
    diff: number;
    ms: number;
    s: number;
    m: number;
    h: number;
    d: number;
  } {
    const diff = earlierDate.valueOf() - laterDate.valueOf();
    return {
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div>
          <h1>It's my life |</h1>
          <h2>don't u forget</h2>
        </div>

        <LocationGrabber
          location={{
            city: currentUser?.city || null,
            country: currentUser?.country || null,
          }}
        />
      </div>
      <hr />
      <h1>My games</h1>
      {currentUser &&
        myGames &&
        myGames.map((game) => {
          const badDate = isDiffNan(new Date(), new Date(game.createdAt));
          if (badDate) {
            return;
          }
          const { h, d } = formatDateDiff(new Date(), new Date(game.createdAt));

          return (
            <div key={game.id}>
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
