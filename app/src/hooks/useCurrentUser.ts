import { useEffect, useState } from "react";
const domain =
  process.env.APP_ENV === "prod"
    ? "https://bingo-server-gylc.onrender.com"
    : "http://localhost:3000";
export const findMe = async (): Promise<
  [
    {
      email: string;
      id: number;
      country: { id: number; name: string; localName: string };
      city: { id: number; name: string; localName: string };
    } | null,
    boolean,
    string
  ]
> => {
  let user = null,
    loading = false,
    error = "";
  const response = await fetch(`${domain}/user/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cache: "no-cache",
    },
  });
  if (response.ok) {
    const { data } = await response.json();
    user = data;
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
    country: { id: number; name: string; localName: string };
    city: { id: number; name: string; localName: string };
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
