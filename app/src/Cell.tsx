import { Text } from "@radix-ui/themes";
import { useState } from "react";
import "./styles/board.css";

export const BingoCell = ({
  text,
  cellId,
  handleClick,
  countable,
  countLimit,
  owner,
  sharedStyle,
}: {
  text: string;
  cellId: number;
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  countable: boolean;
  countLimit?: number;
  owner: string;
  sharedStyle?: string;
}): JSX.Element => {
  const [count, setCount] = useState(0);
  const handleCellClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (countable && count === countLimit) {
      const newCount = count - 1;
      setCount(newCount);
      handleClick(event);
    } else if (countable) {
      const newCount = count + 1;
      setCount(newCount);
      if (newCount === countLimit) {
        handleClick(event);
      }
    } else {
      handleClick(event);
    }
  };

  return (
    <button
      onClick={handleCellClick}
      data-id={cellId}
      key={cellId}
      style={{
        background: `${sharedStyle}`,
      }}
      className={`cell one-to-one ${owner}`}
    >
      <Text
        size="5"
        style={{
          pointerEvents: "none",
          textOverflow: "wrap",
          hyphens: "auto",
        }}
      >
        {text}
      </Text>
      {countable && (
        <Text size="4" className={`opaque bottom-right`}>
          {count}
        </Text>
      )}
    </button>
  );
};
