export const domain = import.meta.env.PROD
  ? "https://bb-api.dngl.cc"
  : "http://localhost:3000";

export const client = import.meta.env.PROD
  ? "https://bb.dngl.cc"
  : "http://localhost:5173";
