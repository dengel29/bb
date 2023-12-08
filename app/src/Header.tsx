// import { useNavigate } from 'react-router-dom';
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import './App.css';

// export default function Header(): JSX.Element {
//   const navigate = useNavigate();
//   const viewNavigate = (newRoute): void | Promise<ViewTransition> => {
//     // Navigate to the new route
//     if (!document.startViewTransition) {
//       navigate(newRoute);
//     } else {
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       //@ts-ignore
//       document.startViewTransition(() => {
//         return navigate(newRoute);
//       });
//     }
//   };
//   return (
//     <div className="header__container">
//       <div className="link__container">
//         <button
//           onClick={(): void => {
//             viewNavigate('/');
//           }}
//         >
//           Home
//         </button>
//         <button
//           onClick={(): void => {
//             viewNavigate('/about');
//           }}
//         >
//           About
//         </button>
//         <button
//           onClick={(): void => {
//             viewNavigate('/sign-in');
//           }}
//         >
//           Sign In
//         </button>
//       </div>
//     </div>
//   );
// }
