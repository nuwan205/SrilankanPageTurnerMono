import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "../../components/admin/Dashboard";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});
