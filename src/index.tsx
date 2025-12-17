/* @refresh reload */
import "./index.css";
import { render, Suspense } from "solid-js/web";
import "solid-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import PanelManager from "./PanelManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <PanelManager />
      </Suspense>
    </QueryClientProvider>
  ),
  root!
);
