import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    id: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const findMe = async (): Promise<void> => {
    setIsLoading(true);
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
      const user = await response.json();
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
      setIsError(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    findMe();
  }, []);
  return { currentUser, isLoading, isError };
};
