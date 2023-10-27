import { PathPrefixedString } from "shared/types";

const domain = "http://localhost:3000";

export async function get<T>(
  path: PathPrefixedString,
  authenticated: boolean
): Promise<T> {
  const options: RequestInit = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (!authenticated) delete options["credentials"];

  const response = await fetch(`${domain}${path}`, options);
  return await response.json();
}

export async function post(
  path: string,
  authenticated: boolean,
  body: any // TODO: set up type dictionary like for sockets
): Promise<Response> {
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  if (!authenticated) delete options["credentials"];

  return await fetch(`${domain}${path}`, options);
}

export const requests = {
  "get:players": "path",
};
