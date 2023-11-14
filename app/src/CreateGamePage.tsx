import { useQuery } from "@tanstack/react-query";
import { CreateBoardForm } from "./CreateBoardForm";
import { PageContainer } from "./PageContainer";
import { RoomList } from "./RoomList";
import "./styles/create-board.css";
import { GetBoardDTO } from "shared/types";
import { get } from "./requests";

export const CreateGamePage = (): JSX.Element => {
  const recentRooms = async () => {
    return await get<GetBoardDTO[]>("/api/get-rooms", false);
  };
  const { data: rooms, refetch: refetchRooms } = useQuery({
    queryFn: recentRooms,
    queryKey: ["rooms"],
  });
  return (
    <PageContainer title={"Create or join a game"}>
      <div className="main__container">
        <RoomList rooms={rooms} />
        <CreateBoardForm refetchRooms={refetchRooms} />
      </div>
    </PageContainer>
  );
};
