import { PathPrefixedString } from "shared/types";

const domain = "http://localhost:3000";

export async function get<T>(
  path: PathPrefixedString,
  authenticated: boolean,
  options?: RequestInit
): Promise<T | string> {
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
  if (response.ok) {
    return await response.json();
  } else {
    return response.statusText;
  }
}

export async function post<T>(
  path: string,
  authenticated: boolean,
  body: Omit<RequestInit["body"], "ReadableStream"> // TODO: set up type dictionary like for sockets
): Promise<T> {
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  if (!authenticated) delete options["credentials"];
  const res = await fetch(`${domain}${path}`, options);
  return await res.json();
}

export const requests = {
  "get:players": "path",
};
