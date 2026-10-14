import { createFileRoute } from "@tanstack/react-router";
import { GuestKiosk } from "@/components/aifa/GuestKiosk";

export const Route = createFileRoute("/guest")({
  head: () => ({
    meta: [
      { title: "Welcome to AIFA — Guest Kiosk" },
      {
        name: "description",
        content:
          "Share feedback or rate your stay at AIFA Hotel. Available in English, French and Arabic.",
      },
      { property: "og:title", content: "Welcome to AIFA — Guest Kiosk" },
      {
        property: "og:description",
        content: "Share feedback or rate your stay at AIFA Hotel.",
      },
    ],
  }),
  component: GuestKiosk,
});
