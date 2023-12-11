export const domain = import.meta.env.PROD
  ? "https://bingo-server-gylc.onrender.com"
  : "http://localhost:3000";

export const client = import.meta.env.PROD
  ? "https://bingo-app-2rtu.onrender.com"
  : "http://localhost:5173";
