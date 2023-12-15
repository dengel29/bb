import type {
  PathPrefixedString,
  SuccessResponse,
  FailureResponse,
  ServerResponse,
} from "shared/types";
import { domain } from "./domain";

export function isSuccessResponse<T>(
  res: SuccessResponse<T> | FailureResponse
): res is SuccessResponse<T> {
  return res.success;
}

export async function get<T>(
  path: PathPrefixedString,
  authenticated: boolean,
  options?: RequestInit
): Promise<ServerResponse<T>> {
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

  const result: ServerResponse<T> = await response.json();

  return result;
  // if (isSuccessResponse(result)) {
  //   return result.data;
  // } else {
  //   return response.statusText;
  // }
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
