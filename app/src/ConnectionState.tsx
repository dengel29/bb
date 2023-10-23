import { PlayerMap } from "shared/types";

export function ConnectionState({
  isConnected,
  players,
  myColor,
  currentUser,
}: {
  isConnected: boolean;
  players: PlayerMap;
  myColor?: string;
  currentUser: { email: string; id: number };
}): JSX.Element {
  return (
    <>
      {isConnected && <p>🟢</p>}
      {!isConnected && <p>🔴</p>}
      <p>Players in this rooom</p>
      {players &&
        Array.from(players).map(([, value]) => {
          return (
            value?.user && (
              <div className="flex-small" key={value.socketId}>
                <div
                  className={`square bg-${
                    (currentUser &&
                      value.user.id === currentUser.id &&
                      myColor) ||
                    value.color
                  }`}
                ></div>
                <p>{value.user.email}</p>
              </div>
            )
          );
        })}
    </>
  );
}
