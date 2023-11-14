import { Text } from "@radix-ui/themes";
import { useState } from "react";

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
        minHeight: "150px",
        width: "100%",
        maxHeight: "200px",
        maxWidth: "200px",
        background: `${sharedStyle}`,
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
      {countable && <Text className={`opaque bottom-right`}>{count}</Text>}
    </button>
  );
};
