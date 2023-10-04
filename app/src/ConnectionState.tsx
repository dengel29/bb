import { Text } from '@radix-ui/themes';

export function ConnectionState({ isConnected, id, messages }): JSX.Element {
  return (
    <>
      <p>
        {id} Connected?: {'' + isConnected}
      </p>
      <Text>Activity</Text>
      <ul>
        {messages.map((m, i) => {
          return <li key={i}>{m.message}</li>;
        })}
      </ul>
    </>
  );
}
