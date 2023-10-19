export const StartButton = ({ players, color }): JSX.Element => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "15%",
      }}
    >
      <button>I'm Ready</button>
      {color && (
        <div
          style={{
            height: "20px",
            width: "20px",
            backgroundColor: `${color}`,
          }}
        ></div>
      )}
    </div>
  );
};
