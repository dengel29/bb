// import { MouseEventHandler } from 'react';
// import { socket } from './socket';
import { Text } from "@radix-ui/themes";

export const BingoCell = ({
  text,
  cellId,
  handleClick,
  // determineOwner,
  owner,
  // score,
}): JSX.Element => {
  return (
    <button
      onClick={handleClick}
      data-id={cellId}
      key={cellId}
      style={{
        height: "150px",
        width: "100%",
      }}
      className={`cell ${owner}`}
    >
      <Text
        size="3"
        style={{
          pointerEvents: "none",
          textOverflow: "wrap",
          hyphens: "auto",
        }}
      >
        {text}
      </Text>
    </button>
  );
};
