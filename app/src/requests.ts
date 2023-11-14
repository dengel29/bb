import { PathPrefixedString } from "shared/types";

const domain = "http://localhost:3000";

export async function get<T>(
  path: PathPrefixedString,
  authenticated: boolean,
  options?: RequestInit
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };
  let opts;

  if (options) {
    // TODO: merge options smarter
    opts = { ...options, ...defaultOptions };
  } else {
    opts = defaultOptions;
  }

  if (!authenticated) delete defaultOptions["credentials"];

  const response = await fetch(`${domain}${path}`, opts);
  return await response.json();
}

export async function post(
  path: string,
  authenticated: boolean,
  body: BodyInit // TODO: set up type dictionary like for sockets
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
