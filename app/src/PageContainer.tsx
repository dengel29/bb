import { Container } from "@radix-ui/themes";
import { PropsWithChildren, useEffect } from "react";
import { useHeader } from "./hooks/useHeader";
import { HeaderNav } from "./HeaderNav";

type PageProps = { title: string } & PropsWithChildren;
export const PageContainer = (props: PageProps) => {
  const header = useHeader();
  useEffect(() => {
    document.title = props.title;
  }, [props.title]);
  return (
    <Container width="100%" style={{ overflowX: "hidden" }}>
      {header ? <HeaderNav /> : null}
      <div style={{}}>{props.children}</div>
    </Container>
  );
};
