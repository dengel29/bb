export const StartButton = ({
  clickHandler,
  color,
  allReady,
}: {
  clickHandler: () => void;
  color: string;
  allReady: boolean;
}): JSX.Element => {
  return (
    <div className="flex-small">
      <button
        onClick={clickHandler}
        disabled={allReady || !color || color === " white"}
      >
        {allReady ? "Everyone's ready!" : "I'm Ready"}
      </button>
      {color && <div className={`square bg-${color}`}></div>}
    </div>
  );
};
