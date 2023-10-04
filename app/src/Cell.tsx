// import { MouseEventHandler } from 'react';
// import { socket } from './socket';
import { Text } from '@radix-ui/themes';

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
        border: '1px solid red',
        height: '150px',
        width: '100%',
      }}
      className={owner}
    >
      <Text size="5" style={{ pointerEvents: 'none' }}>
        {text}
      </Text>
    </button>
  );
};
