export const domain = import.meta.env.PROD
  ? "https://bb-api.dngl.cc"
  : "http://192.168.33.26:3000";
// : "http://localhost:3000";

export const client = import.meta.env.PROD
  ? "https://bb.dngl.cc"
  : "http://192.168.33.26:5173";
// : "http://localhost:5173";
