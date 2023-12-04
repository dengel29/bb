export const loadConfig = () => {
  if (process.env.NODE_ENV === "dev") {
    return require("../config.js");
  } else {
    return process.env;
  }
};
