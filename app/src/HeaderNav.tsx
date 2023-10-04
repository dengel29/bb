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
      <button>Create objectives</button>
      <button>Join a game</button>
      <button>About</button>
      <a href="/sign-in">Sign In</a>
    </div>
  );
};
