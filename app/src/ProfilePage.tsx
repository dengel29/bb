import { useState, useEffect } from "react";
import { MyGamesDTO } from "shared/types";
import { PageContainer } from "./PageContainer";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Link } from "react-router-dom";
export const ProfilePage = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();
  const [myGames, setMyGames] = useState<MyGamesDTO[]>([]);

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

  useEffect(() => {
    if (currentUser?.id && !loading) {
      getMyGames().then((games: MyGamesDTO[]) => {
        setMyGames(games);
      });
    }
  }, [currentUser, loading]);

  return (
    <PageContainer title={"Profile"}>
      <h1>It's my life</h1>
      <hr />
      <h1>My games</h1>
      {currentUser &&
        myGames.map((game) => {
          return <Link to={`/play/${game.id}`}>{game.name}</Link>;
        })}
    </PageContainer>
  );
};
