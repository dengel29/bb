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
    <Container>
      {header ? <HeaderNav /> : null}
      {props.children}
    </Container>
  );
};
