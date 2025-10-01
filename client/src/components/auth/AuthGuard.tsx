import { useSession } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

interface AuthGuardProps {
  readonly children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Give a bit more time for session to load before redirecting
    if (!isPending && !session?.user) {
      const timer = setTimeout(() => {
        if (!session?.user) {
          toast.error("Please sign in to access the admin panel");
          navigate({ to: '/auth/signin' });
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [session, isPending, navigate]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing while redirecting if not authenticated
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}
