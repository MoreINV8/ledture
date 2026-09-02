import { useState } from "react";
import type { FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { ApiError, authService } from "../service";
import { BrandLogo, Button, Card, Input, Label, Toast } from "../components";

export interface SignupPageProps {
  onRegistered: (email: string) => void;
  onShowLogin: () => void;
}

const SignupPage = ({ onRegistered, onShowLogin }: SignupPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(normalizedEmail, password);
      onRegistered(normalizedEmail);
    } catch (signupError) {
      if (signupError instanceof ApiError && signupError.status === 409) {
        setError("An account already exists for this email address.");
      } else {
        setError(
          "We could not create your account. Check your connection and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibilityButton = (label: string) => (
    <button
      type="button"
      className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      onClick={() => setShowPassword((visible) => !visible)}
      aria-label={`${showPassword ? "Hide" : "Show"} ${label}`}
      disabled={isSubmitting}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );

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
        <div className="mb-7 text-center">
          <BrandLogo className="mx-auto w-14 md:w-64" />
        </div>

        <Card className="p-6 shadow-2xl shadow-slate-950/50 sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              Start keeping your personal ledger organized and secure.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email" required>
                Email address
              </Label>
              <Input
                id="signup-email"
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
              <Label
                htmlFor="signup-password"
                required
                hint="At least 8 characters"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  icon={<LockKeyhole className="h-4 w-4" />}
                  className="pr-12"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                {visibilityButton("password")}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" required>
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  className="pr-12"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                {visibilityButton("confirmed password")}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2"
              disabled={isSubmitting}
              icon={
                isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )
              }
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onShowLogin}
              className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300 focus:outline-none focus:underline"
            >
              Sign in
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

export default SignupPage;
