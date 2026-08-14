"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupInput) => {
    setServerError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sage-soft text-sage mb-4">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-ink">
          {t("common.checkInbox")}
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {t("auth.confirmEmailBody")}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="secondary">{t("common.backToSignIn")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">{t("auth.createTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("auth.createSubtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <Input
          label={t("auth.name")}
          autoComplete="name"
          placeholder="Alex"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <Input
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t("auth.password")}
          type="password"
          autoComplete="new-password"
          placeholder={t("auth.min8")}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label={t("auth.confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder={t("auth.repeatPassword")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {t("auth.createAccount")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-medium text-ink hover:underline underline-offset-4"
        >
          {t("common.signIn")}
        </Link>
      </p>
    </>
  );
}
