"use client";

import BrandLogo from "@/components/BrandLogo";
import LegalNote from "@/components/LegalNote";
import TemplatePreviewCard from "@/components/TemplatePreviewCard";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchTemplateSettings, updateTemplateSettings } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { PASSATS_TEMPLATES } from "@/lib/resumeTemplates";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TemplatesPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>("atlas");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const authed = isLoggedIn();
    setLoggedIn(authed);
    if (!authed) return;
    fetchTemplateSettings()
      .then((s: any) => {
        if (s?.preset_id) setActiveId(s.preset_id);
      })
      .catch(() => {});
  }, []);

  async function applyTemplate() {
    const preset = PASSATS_TEMPLATES.find((t) => t.id === activeId);
    if (!preset) return;
    if (!isLoggedIn()) {
      router.push("/login?register=1");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await updateTemplateSettings(preset.settings);
      setMessage(`Applied “${preset.name}” layout to your exports.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save layout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loggedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Sign in to apply
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Layout presets</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Three original PassATS export layouts — typography, spacing, and section order only.
          Previews are generated in code, not imported from external design files.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PASSATS_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setActiveId(template.id)}
              className={`card text-left transition ${
                activeId === template.id ? "ring-2 ring-brand-600" : "hover:shadow-md"
              }`}
            >
              <TemplatePreviewCard template={template} selected={activeId === template.id} />
              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Font: {template.settings.font_name} · {template.settings.max_pages} pages max
              </p>
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button type="button" onClick={applyTemplate} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : loggedIn ? "Use this layout for exports" : "Sign in to apply layout"}
          </button>
          {loggedIn && (
            <Link href="/optimize" className="btn-secondary">
              Open resume editor
            </Link>
          )}
          {message && <p className="text-sm text-brand-700 dark:text-brand-400">{message}</p>}
        </div>

        <LegalNote className="mt-12 max-w-3xl" />
      </main>
    </div>
  );
}
