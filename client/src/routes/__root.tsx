import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "../components/ui/toaster";
import { Toaster as Sonner } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";

export const Route = createRootRoute({
	component: () => (
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<Outlet />
			<TanStackRouterDevtools />
		</TooltipProvider>
	),
});
