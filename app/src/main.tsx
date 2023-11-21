import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

// Create a client

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="bottom-center" toastOptions={{ duration: 3500 }} />
    </QueryClientProvider>
  </React.StrictMode>
);
