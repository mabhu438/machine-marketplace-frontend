import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("mm_token");
      window.location.replace(token ? "/dashboard" : "/login");
    }
  },
  component: () => null,
});
