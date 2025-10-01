import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "@/lib/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: session } = useSession();

  // Handle redirect after successful sign-in
  useEffect(() => {
    if (session?.user) {
      toast.success("Welcome back! Redirecting to admin panel...");
      // Use a small delay to ensure the session is fully established
      setTimeout(() => {
        navigate({ to: '/admin' });
      }, 100);
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: async (context) => {
            console.log("Sign in success:", context);
            toast.success("Successfully signed in! Redirecting...");
            
            // Wait a bit longer for the session to be properly set
            setTimeout(() => {
              window.location.href = '/admin'; // Force a full page navigation
            }, 1000);
          },
          onError: (ctx) => {
            console.error("Sign in error:", ctx);
            toast.error(ctx.error?.message || "Sign in failed");
            setLoading(false);
          }
        }
      });

      console.log("Sign in result:", result);
      
      if (result.error) {
        toast.error(result.error.message || "Sign in failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M9 3v18" />
              <path d="m16 16-3-3 3-3" />
            </svg>
          </div>
          Sri Lankan Page Tuner
        </Link>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        value={email}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                          onClick={() => {
                            // Handle forgot password functionality
                            console.log("Forgot password clicked");
                          }}
                        >
                          Forgot your password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
