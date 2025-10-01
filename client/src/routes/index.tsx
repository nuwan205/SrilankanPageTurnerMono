import { createFileRoute } from "@tanstack/react-router";
import TourismBook from "../components/TourismBook";
import "../index.css";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	// Force light mode for main website
	useEffect(() => {
		document.documentElement.classList.remove('dark');
		document.documentElement.classList.add('light');
	}, []);

	return <TourismBook />;
}
