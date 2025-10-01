import { createFileRoute } from "@tanstack/react-router";
import AdminCategories from "../../components/admin/Categories";

export const Route = createFileRoute("/admin/categories")({
	component: AdminCategories,
});
