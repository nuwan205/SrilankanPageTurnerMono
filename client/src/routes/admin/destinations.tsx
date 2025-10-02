import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/destinations")({
	component: DestinationsLayout,
});

function DestinationsLayout() {
	return <Outlet />;
}
