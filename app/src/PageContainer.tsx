import { Container } from "@radix-ui/themes";
import { PropsWithChildren, useEffect } from "react";
import { useHeader } from "./hooks/useHeader";

type PageProps = { title: string } & PropsWithChildren;
export const PageContainer = (props: PageProps) => {
  const header = useHeader();
  useEffect(() => {
    document.title = props.title;
  }, [props.title]);
  return (
    <Container>
      {header}
      {props.children}
    </Container>
  );
};
