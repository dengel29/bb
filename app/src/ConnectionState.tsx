import { PlayerMap } from "shared/types";

export function ConnectionState({
  isConnected,
  players,
}: {
  isConnected: boolean;
  players: PlayerMap;
}): JSX.Element {
  return (
    <>
      {isConnected && <p>🟢</p>}
      {!isConnected && <p>🔴</p>}
      <p>Players in this rooom</p>
      {players &&
        Array.from(players).map(([, player]) => {
          return (
            player?.user && (
              <div className="flex-small" key={player.socketId}>
                <div
                  className={`square bg-${player.color} slide-in delay-1`}
                ></div>
                <p className="slide-in">{player.user.email}</p>
              </div>
            )
          );
        })}
    </>
  );
}
