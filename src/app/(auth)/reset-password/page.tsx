"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      setServerError(
        error.message.includes("session")
          ? t("auth.resetExpired")
          : error.message
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <h1 className="text-xl font-semibold text-ink">
        {t("auth.newPasswordTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted">{t("auth.newPasswordSubtitle")}</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <Input
          label={t("auth.newPassword")}
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
          placeholder={t("auth.repeatNewPassword")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p role="alert" className="text-sm text-terracotta">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          {t("auth.updatePassword")}
        </Button>
      </form>
    </>
  );
}
