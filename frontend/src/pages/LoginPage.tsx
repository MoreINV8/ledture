import { useState } from "react";
import type { FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { APP_NAME } from "../constants";
import { ApiError, authService } from "../service";
import { BrandLogo, Button, Card, Input, Label, Toast } from "../components";

export interface LoginPageProps {
  onLogin: (email: string) => void;
  onShowSignup: () => void;
  initialEmail?: string;
  successMessage?: string;
}

const LoginPage = ({
  onLogin,
  onShowSignup,
  initialEmail = "",
  successMessage,
}: LoginPageProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.login(email.trim(), password);
      onLogin(email.trim());
    } catch (loginError) {
      if (loginError instanceof ApiError && loginError.status === 401) {
        setError("The email or password you entered is incorrect.");
      } else {
        setError(
          "We could not sign you in. Check your connection and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100 selection:bg-emerald-500 selection:text-white sm:px-6">
      {error && (
        <Toast
          message={{ text: error, type: "error" }}
          onDismiss={() => setError("")}
        />
      )}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.24)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto w-14 md:w-64" />
        </div>

        <Card className="p-6 shadow-2xl shadow-slate-950/50 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              Sign in to continue to your personal ledger.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {successMessage && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3 text-xs leading-relaxed text-emerald-300"
              >
                {successMessage}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" required>
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  icon={<LockKeyhole className="h-4 w-4" />}
                  className="pr-12"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isSubmitting}
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
              variant="primary"
              size="lg"
              className="mt-1"
              disabled={isSubmitting}
              icon={
                isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )
              }
            >
              {isSubmitting ? "Signing in…" : "Sign in securely"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center text-sm text-slate-400">
            New to {APP_NAME}?{" "}
            <button
              type="button"
              onClick={onShowSignup}
              className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300 focus:outline-none focus:underline"
            >
              Create an account
            </button>
          </div>
        </Card>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
          Your ledger is private and protected.
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
