import { Link } from "react-router-dom";
import { PageContainer } from "./PageContainer";
import { useCurrentUser } from "./hooks/useCurrentUser";

export const LoggedInPage = (): JSX.Element => {
  const { currentUser, isLoading } = useCurrentUser();

  const loginStatus = isLoading ? (
    <h1>Making sure you're logged in...</h1>
  ) : (
    <h1>Hey, {currentUser?.email} you're logged in, that's neat</h1>
  );

  return (
    <PageContainer title={"Success!"}>
      {loginStatus}
      <Link to="/home">Go home and get started</Link>
      {/* <button onClick={() => findMe()}>See if you're logged in</button> */}
    </PageContainer>
  );
};
