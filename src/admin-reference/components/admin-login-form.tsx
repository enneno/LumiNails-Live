"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../model";
const createClient = () => ({auth:{signInWithPassword:({password}:any)=>api().signIn(password)}});
import { isAdminTab } from "@/lib/admin-navigation";
import { siteConfig } from "@/data/site-content";
import { adminFieldClass, adminPrimaryButtonClass } from "@/components/admin-ui";
import { useBrowserSearch } from "@/components/use-browser-search";

const adminEmail = () => api().authEmail();

export function AdminLoginForm({externalError=""}:{externalError?:string}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const search = useBrowserSearch();
  const message = error || externalError || (new URLSearchParams(search).get("reason") === "unauthorized"
    ? "Ehhez a fiókhoz nincs adminisztrátori jogosultság." : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(form: HTMLFormElement) {
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(form);
    const supabase = createClient();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (signInError) {
        setError(signInError.code === "invalid_credentials"
          ? "A belépési adatok nem megfelelőek."
          : "A belépés nem sikerült. Ellenőrizd a kapcsolatot, és próbáld újra.");
        return;
      }

      // This form is browser-only. The cached shell's router context has no
      // request query; use the current URL for the requested destination.
      const tab = new URLSearchParams(window.location.search).get("tab");
      const redirectTab = isAdminTab(tab) ? tab : undefined;
      router.replace(
        redirectTab ? `${siteConfig.adminPath}?tab=${redirectTab}` : siteConfig.adminPath,
      );
    } catch {
      setError("A belépés nem sikerült. Ellenőrizd a kapcsolatot, és próbáld újra.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      aria-busy={isSubmitting}
      className="mt-5 grid gap-3.5"
    >
      <input name="email" type="hidden" value={adminEmail()} autoComplete="username" readOnly />
      <label className="text-xs font-bold" htmlFor="admin-password">
        Jelszó
        <span className="relative mt-2 block">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            enterKeyHint="done"
            required
            minLength={8}
            className={`${adminFieldClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0.5 right-0.5 min-h-9 rounded-lg px-3 text-[0.68rem] font-bold text-gold-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark"
            aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
          >
            {showPassword ? "Elrejt" : "Mutat"}
          </button>
        </span>
      </label>
      {message ? (
        <p role="alert" className="rounded-lg border border-admin-danger/30 bg-admin-danger/10 px-3 py-2.5 text-xs font-semibold text-admin-danger">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (form?.reportValidity()) void handleSubmit(form);
        }}
        disabled={isSubmitting}
        className={adminPrimaryButtonClass}
      >
        {isSubmitting ? "Belépés…" : "Belépés"}
      </button>
    </form>
  );
}
