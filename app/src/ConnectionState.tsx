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
        Array.from(players).map(([_key, value]) => {
          return value?.user && <p key={value.user.id}>{value.user.email}</p>;
        })}
    </>
  );
}
