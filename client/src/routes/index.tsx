import { createFileRoute } from "@tanstack/react-router";
import TourismBook from "../components/TourismBook";
import "../index.css";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return <TourismBook />;
}
