import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/aifa/AppShell";
import { FeedbackView } from "@/components/aifa/FeedbackView";

export const Route = createFileRoute("/staff/feedback")({
  head: () => ({
    meta: [
      { title: "Guest Feedback — AIFA Hotel" },
      {
        name: "description",
        content: "Review and resolve AIFA guest comments and ratings.",
      },
      { property: "og:title", content: "Guest Feedback — AIFA Hotel" },
      {
        property: "og:description",
        content: "Review and resolve guest comments and ratings.",
      },
    ],
  }),
  component: () => (
    <AppShell title="Guest Feedback">
      <FeedbackView />
    </AppShell>
  ),
});
