import type { PlayerMap } from "shared/types";

export function ConnectionState({
  isConnected,
  players,
}: {
  isConnected: boolean;
  players: PlayerMap;
}): JSX.Element {
  return (
    <>
      {/* <div> */}
      <details open style={{ marginBlock: 0, paddingBlock: 0 }}>
        <summary>
          <div style={{ display: "flex" }}>
            {isConnected && <p>🟢</p>}
            {!isConnected && <p>🔴</p>}
            <div>
              <span style={{ display: "inline" }}>
                <p>Players in this room (tap to hide)</p>
              </span>
            </div>
          </div>
        </summary>
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
      </details>
      {/* </div> */}
    </>
  );
}
