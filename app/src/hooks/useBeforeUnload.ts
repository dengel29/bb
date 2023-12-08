// import { useEffect } from "react";

// export const useOnPageLeave = (handler: () => void) => {
//   useEffect(() => {
//     window.onbeforeunload = () => handler();

//     window.addEventListener("beforeunload", (event) => {
//       // event.preventDefault();
//       // event.stopImmediatePropagation();
//       handler();
//     });

//     return () => {
//       handler();
//       document.removeEventListener("beforeunload", handler);
//     };
//   }, []);
// };
