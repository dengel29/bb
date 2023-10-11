import { Link } from "react-router-dom";
import { PageContainer } from "./PageContainer";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useState, useEffect } from "react";

export const LoggedInPage = (): JSX.Element => {
  const { currentUser, loading, error } = useCurrentUser();
  const [loginStatus, setLoginStatus] = useState<string>();

  useEffect(() => {
    const determineLoginStatus = () => {
      if (loading) {
        setLoginStatus("Making sure you're logged in..");
      } else if (currentUser && !loading) {
        setLoginStatus(
          `Hey, ${currentUser.email} you're logged in, that's neat`
        );
      } else if (error && !loading) {
        setLoginStatus(error);
      }
    };

    determineLoginStatus();
  }, [error, loading, currentUser]);

  return (
    <PageContainer title={"Success!"}>
      <h1>{loginStatus}</h1>
      <Link to="/home">Go home and get started</Link>
      {/* <button onClick={() => findMe()}>See if you're logged in</button> */}
    </PageContainer>
  );
};
