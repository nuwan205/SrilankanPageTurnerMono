import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, FolderTree, MapPin, Menu, X, LogOut, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import '../components/admin/admin-dark.css';
import { AuthGuard } from '../components/auth/AuthGuard';
import { signOut } from '../lib/auth';
import { toast } from 'sonner';

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						toast.success('Successfully logged out');
						window.location.href = '/';
					},
					onError: () => {
						toast.error('Error logging out');
					}
				}
			});
		} catch (error) {
			toast.error('Error logging out');
		}
	};

	// Force dark mode for admin panel
	useEffect(() => {
		// Force dark mode on both html and body
		document.documentElement.classList.add('dark');
		document.documentElement.classList.remove('light');
		document.body.classList.add('dark');
		document.body.classList.remove('light');
		
		// Set data attributes as well for better compatibility
		document.documentElement.setAttribute('data-theme', 'dark');
		
		return () => {
			// Clean up - remove dark mode when leaving admin
			document.documentElement.classList.remove('dark');
			document.documentElement.classList.add('light');
			document.body.classList.remove('dark');
			document.body.classList.add('light');
			document.documentElement.setAttribute('data-theme', 'light');
		};
	}, []);

	const navigation = [
		{ name: 'Dashboard', href: '/admin/', icon: LayoutDashboard },
		{ name: 'Categories', href: '/admin/categories', icon: FolderTree },
		{ name: 'Destinations', href: '/admin/destinations', icon: MapPin },
		{ name: 'Ads', href: '/admin/ads', icon: Megaphone },
	];

	const isActive = (href: string) => {
		if (href === '/admin/') {
			return location.pathname === '/admin' || location.pathname === '/admin/';
		}
		return location.pathname.startsWith(href);
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-background dark admin-dark-mode" style={{ colorScheme: 'dark' }}>
				{/* Mobile header */}
				<div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
				<h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>
			</div>

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed top-0 left-0 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out z-40',
					'lg:translate-x-0',
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="h-16 flex items-center justify-center px-6 border-b border-border">
						<h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-6 space-y-1">
						{navigation.map((item) => {
							const active = isActive(item.href);
							return (
								<Link
									key={item.name}
									to={item.href}
									className={cn(
										'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
										active
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									)}
									onClick={() => setSidebarOpen(false)}
								>
									<item.icon className="h-5 w-5" />
									{item.name}
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="p-6 border-t border-border space-y-3">
						<Link
							to="/"
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							← Back to Website
						</Link>
						<Button
							onClick={handleLogout}
							variant="ghost"
							className="w-full justify-start text-muted-foreground hover:text-foreground p-0 h-auto"
						>
							<LogOut className="h-4 w-4 mr-2" />
							Logout
						</Button>
					</div>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setSidebarOpen(false)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							setSidebarOpen(false);
						}
					}}
					aria-label="Close sidebar"
				/>
			)}

			{/* Main content */}
			<main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
				<Outlet />
			</main>
		</div>
		</AuthGuard>
	);
}
