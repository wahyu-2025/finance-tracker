import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import axios from "axios";

export interface ErrorResponseType {
  status: boolean;
  error_code: number;
  message: string;
  error: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: unknown) {
      if (axios.isAxiosError<ErrorResponseType>(err)) {
        setError(
          err.response?.data?.error ??
            err.response?.data?.message ??
            "Login failed",
        );
      } else {
        setError("Login failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md p-8 glassmorphism">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your finances
          </p>
        </div>
        {error && (
          <div className="mb-4 text-sm text-red-500 text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
}
