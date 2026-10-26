import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export interface ErrorResponseType {
  status: boolean;
  error_code: number;
  message: string;
  error: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-slate-900 p-12 lg:flex">
        <img
          src="/media/images/logo-fintrack/ft-logo-dark.png"
          alt="Finance Tracker"
          className="h-65 w-auto self-start"
        />
        <div className="max-w-md ">
          <h2 className="text-5xl font-bold leading-tight text-white">
            Pantau setiap rupiah, capai setiap target.
          </h2>
          <p className="mt-4 text-slate-400">
            Catat transaksi, atur anggaran bulanan, dan lihat ke mana uangmu
            pergi, semua di satu tempat.
          </p>
        </div>

        <p className="text-sm text-slate-500 mt-auto">
          © {new Date().getFullYear()} Finance Tracker
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6 ">
        <div className="w-full max-w-max">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-center">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-muted-foreground ">
              Masuk untuk mendapatkan pengalaman baru menggunakan Finance
              Tracker
            </p>
            {error && (
              <div className="mb-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8 mt-5">
              <div>
                <label className="text-1xl font-bold mb-1 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-1xl font-bold mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword
                        ? "Sembunyikan Password"
                        : "Tampilkan Password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6 bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{""}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
