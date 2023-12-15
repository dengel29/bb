import { useQuery } from "@tanstack/react-query";
import { CreateBoardForm } from "./CreateBoardForm";
import { PageContainer } from "./PageContainer";
import { RoomList } from "./RoomList";
import "./styles/create-board.css";
import type { GetBoardDTO } from "shared/types";
import { get, isSuccessResponse } from "./requests";

export const CreateGamePage = (): JSX.Element => {
  const recentRooms = async () => {
    const response = await get<GetBoardDTO[]>("/api/get-rooms", false);

    if (isSuccessResponse(response)) {
      return response.data;
    } else {
      throw new Error(response.data.error);
    }
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
