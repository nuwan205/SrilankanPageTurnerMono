import { createFileRoute } from "@tanstack/react-router";
import AdminDestinations from "../../components/admin/Destinations";

export const Route = createFileRoute("/admin/destinations")({
	component: AdminDestinations,
});
