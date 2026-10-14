import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { StaffUIProvider } from "@/components/aifa/StaffUI";
import { useHotel } from "@/lib/hotel/store";

export const Route = createFileRoute("/staff")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: StaffLayout,
});

function StaffLayout() {
  const { state } = useHotel();
  const navigate = useNavigate();
  useEffect(() => {
    if (!state.role) navigate({ to: "/" });
  }, [state.role, navigate]);
  if (!state.role) return null;
  return (
    <StaffUIProvider>
      <Outlet />
    </StaffUIProvider>
  );
}
