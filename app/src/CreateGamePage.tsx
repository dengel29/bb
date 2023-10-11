import { CreateBoardForm } from "./CreateBoardForm";
import { PageContainer } from "./PageContainer";
import { RoomList } from "./RoomList";
import "./styles/create-board.css";

export const CreateGamePage = (): JSX.Element => {
  return (
    <PageContainer title={"Create or join a game"}>
      <div className="main__container">
        <RoomList />
        <CreateBoardForm />
      </div>
    </PageContainer>
  );
};
