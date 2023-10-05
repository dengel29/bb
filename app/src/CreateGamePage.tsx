import { CreateBoardForm } from "./CreateBoardForm";
import { PageContainer } from "./PageContainer";

export const CreateGamePage = (): JSX.Element => {
  return (
    <PageContainer title={"Create or join a game"}>
      <CreateBoardForm />
    </PageContainer>
  );
};
