"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-sage-soft text-sage mb-4">
          <MailCheck className="size-5" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-ink">
          {t("common.checkInbox")}
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {t("auth.resetSentBody")}
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="secondary">{t("common.backToSignIn")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">{t("auth.resetTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("auth.resetSubtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <Input
          label={t("auth.email")}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {t("auth.sendResetLink")}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link
          href="/login"
          className="text-muted hover:text-ink transition-colors"
        >
          {t("common.backToSignIn")}
        </Link>
      </p>
    </>
  );
}
