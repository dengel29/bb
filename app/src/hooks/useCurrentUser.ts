import { useEffect, useState } from "react";

export const findMe = async (): Promise<
  [{ email: string; id: number } | null, boolean, string]
> => {
  let user = null,
    loading = false,
    error = "";
  const response = await fetch("http://localhost:3000/user/me", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cache: "no-cache",
    },
  });
  if (response.ok) {
    user = await response.json();
  } else {
    user = null;
    error =
      response.status === 401
        ? "Unauthorized, please sign in"
        : "Some other error has occurred baby";
  }
  loading = false;
  return [user, loading, error];
};

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    id: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    findMe().then((loginStatus) => {
      const [user, loading, error] = loginStatus;
      setCurrentUser(user);
      setIsLoading(loading);
      setError(error);
    });
  }, []);
  return { currentUser, loading: isLoading, error };
};
