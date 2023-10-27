import { useState } from "react";

export const StartButton = ({
  clickHandler,
  color,
  allReady,
}: {
  clickHandler: () => void;
  color: string;
  allReady: boolean;
}): JSX.Element => {
  const [ready, setReady] = useState(false);
  const disabled = allReady || color === "white";
  const pulse = !ready && !allReady ? "pulse" : "";
  let buttonText;
  if (disabled && !allReady) {
    buttonText = "Please choose a color";
  } else if (disabled && allReady) {
    buttonText = "Everyone's ready";
  } else if (!disabled && !allReady) {
    buttonText = "I'm ready!";
  }
  console.log("start button color", color);
  return (
    <div className="flex-small">
      <button
        onClick={() => {
          clickHandler();
          setReady(true);
        }}
        disabled={disabled}
        className={`bg-${color} ${pulse}`}
      >
        {buttonText}
      </button>
      {/* {color && <div className={`square bg-${color}`}></div>} */}
    </div>
  );
};
