export const HeaderNav = (): JSX.Element => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-evenly",
      }}
    >
      <button>Hey</button>
      <a href="/create-objectives">Create objectives</a>
      <button>Join a game</button>
      <button>About</button>
      <a href="/sign-in">Sign In</a>
    </div>
  );
};
