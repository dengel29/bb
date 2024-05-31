import { useEffect, useState } from "react";
import { domain } from "../domain";

export const findMe = async (): Promise<
  [
    (
      | {
          email: string;
          id: number;
          country: { id: number; name: string; localName: string };
          city: { id: number; name: string; localName: string };
        }
      | undefined
    ),
    boolean,
    string
  ]
> => {
  let user = null,
    loading = false,
    error = "";
  try {
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
      console.log("what");
      user = null;
      error =
        response.status === 401
          ? "Unauthorized, please sign in"
          : "Some other error has occurred baby";
    }
    loading = false;
    return [user, loading, error];
  } catch (err) {
    console.log("an error has been thrown");
    return [undefined, false, "User not found"];
  }
};

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<
    | {
        email: string;
        id: number;
        country: { id: number; name: string; localName: string };
        city: { id: number; name: string; localName: string };
      }
    | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    findMe()
      .then((loginStatus) => {
        const [user, loading, error] = loginStatus;
        setCurrentUser(user);
        setIsLoading(loading);
        setError(error);
      })
      .catch((err) => console.log(err));
  }, []);
  return { currentUser, loading: isLoading, error };
};
