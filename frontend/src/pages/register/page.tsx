import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AxiosErrorResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

const Features = [
  "Catat pemasukan dan pengeluaran",
  "Atur budget bulanan per kategori",
  "Pantau saldo semua wallet",
];

const TagLine = [
  { text: "Pantau" },
  { text: "setiap" },
  { text: "rupiah,", highlight: true },
  { text: "capai" },
  { text: "setiap" },
  { text: "target.", highlight: true, underline: true },
];

export function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animasi = (delay = "") =>
    `transition-all duration-700 ease-out motion-reduce:transition-none ${delay} ${
      mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ fullname, email, password });
    } catch (err: unknown) {
      const axiosErr = err as AxiosErrorResponse;
      setError(axiosErr.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-slate-900 p-12 lg:flex xl:p-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <img
          src="/media/images/logo-fintrack/ft-logo-dark.png"
          alt="Finance Tracker"
          className="h-65 w-auto self-start"
        />
        {/* <div className="max-w-md ">
          <h2 className="text-5xl font-bold leading-tight text-white">
            Pantau setiap rupiah, capai setiap target.
          </h2>
          <p className="mt-4 text-slate-400">
            Catat transaksi, atur anggaran bulanan, dan lihat ke mana uangmu
            pergi, semua di satu tempat.
          </p>
        </div> */}

        <div
          className={`relative mt-12 max-w-md xl:mt-14 ${animasi("delay-100")}`}
        >
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            {TagLine.map((anim, i) => (
              <span key={i}>
                <span className="inline-block overflow-hidden pb-2 align-bottom">
                  <span
                    className={`relative inline-block transition-all duration-700 ease-out motion-reduce:transition-none ${
                      mounted
                        ? "translate-y-0 opacity-100"
                        : "translate-y-full opacity-0"
                    }`}
                    style={{ transitionDelay: `${200 + i * 90}ms` }}
                  >
                    <span
                      className={
                        anim.highlight
                          ? "bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent"
                          : ""
                      }
                    >
                      {anim.text}
                    </span>
                    {anim.underline && (
                      <span
                        className="absolute bottom-0 left-0 h-1 rounded-full bg-emerald-400 transition-[width] delay-[1100ms] duration-700 ease-out motion-reduce:transition-none"
                        style={{ width: mounted ? "100%" : "0%" }}
                      />
                    )}
                  </span>
                </span>{" "}
              </span>
            ))}
          </h2>
          <p className="mt-4 text-slate-400">
            Catat transaksi, atur anggaran bulanan, dan lihat ke mana uangmu
            pergi, semua di satu tempat.
          </p>
          <ul className="mt-8 space-y-3">
            {Features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`relative mt-10 grid w-full max-w-2xl grid-cols-3 gap-4 [@media(max-height:760px)]:hidden ${animasi("delay-200")}`}
          aria-hidden="true"
        >
          {/* card 1 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-400/100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Total Saldo
            </div>
            <p className="mt-2 text-lg font-bold text-white">Rp 12.450.000</p>
            <p className="mt-1 text-xs text-emerald-400">+8% bulan ini</p>
          </div>
          {/* card 2 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-400/100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-slate-400">Budget Makan</span>
              <span className="font-semibold text-white">80%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] delay-500 duration-1000 ease-out motion-reduce:transition-none"
                style={{ width: mounted ? "80%" : "0%" }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Rp 1,24 jt / Rp 2 jt</p>
          </div>
          {/* card 3 */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-400/100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-slate-400">Cicilan Motor</span>
              <span className="font-semibold text-white">20%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] delay-500 duration-1000 ease-out motion-reduce:transition-none"
                style={{ width: mounted ? "20%" : "0%" }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Rp 200 RB / Rp 2 jt</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mt-auto">
          © {new Date().getFullYear()} Finance Tracker
        </p>
      </div>

      {/* Responsif Mode */}
      <div className="flex flex-col bg-background ">
        <div
          className={`relative overflow-hidden rounded-b-3xl bg-slate-900 px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-10 sm:pb-10 lg:hidden ${animasi()}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="relative mx-auto max-w-md">
            <img
              src="/media/images/logo-fintrack/ft-logo-dark.png"
              alt="Finance Tracker"
              className="h-9 w-auto sm:h-10"
            />
            <p className="mt-6 font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              Pantau setiap{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                rupiah
              </span>
              , capai setiap{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                target
              </span>
              .
            </p>
            <p className="mt-2 hidden text-sm text-slate-400 sm:block">
              Catat transaksi, atur anggaran bulanan, dan lihat ke mana uangmu
              pergi.
            </p>
          </div>
        </div>

        {/* bawah */}
        <div className="flex flex-1 items-start justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:px-10 sm:pt-12 lg:items-center lg:p-12">
          <div className={`w-full max-w-md ${animasi("delay-150")}`}>
            <h1 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
              Create Account
            </h1>
            <p className="mt-2 text-center text-sm text-foreground sm:text-base">
              Join us to start tracking
            </p>
            {error && (
              <div className="mb-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              {/* FullName */}
              <div>
                <label className="text-sm text-foreground font-bold mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Jhon Doe"
                    className="h-11 pl-10 text-base sm:text-sm"
                    required
                  />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="text-sm text-foreground font-bold mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 pl-10 text-base sm:text-sm"
                    required
                  />
                </div>
              </div>
              {/* password */}
              <div>
                <label className="text-sm text-foreground font-bold mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-11 text-base sm:text-sm"
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
                className="h-11 w-full bg-emerald-600 text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have Account ?
              <Link
                to="/login"
                className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

 
}
