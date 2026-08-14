"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode, DEMO_CREDENTIALS } from "@/lib/demo/config";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const demo = isDemoMode();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: demo
      ? { email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }
      : undefined,
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message
      );
      return;
    }
    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to your tracker.</p>

      {demo && (
        <div className="mt-5 rounded-xl border border-tan-soft bg-tan-faint px-4 py-3 text-sm text-ink-soft">
          <p className="font-medium text-ink">Demo mode</p>
          <p className="mt-0.5 leading-relaxed">
            No account needed — the fields are pre-filled. Just press{" "}
            <span className="font-medium text-ink">Sign in</span> to explore with
            sample data stored only in this browser.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-muted hover:text-ink transition-colors"
        >
          Forgot password?
        </Link>
        <Link
          href="/signup"
          className="font-medium text-ink hover:underline underline-offset-4"
        >
          Create account
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
