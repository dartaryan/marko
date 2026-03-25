'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDocDirection } from '@/lib/hooks/useDocDirection';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { useFontSize, type FontSize } from '@/lib/hooks/useFontSize';
import { useDarkLightModePref, type DarkLightModePref } from '@/lib/hooks/useDarkLightModePref';
import { useThemeSelection } from '@/lib/hooks/useThemeSelection';
import { useColorTheme } from '@/lib/hooks/useColorTheme';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useCustomPresets } from '@/lib/hooks/useCustomPresets';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { applyColorTheme } from '@/lib/colors/apply-colors';
import { PresetGrid } from '@/components/theme/PresetGrid';
import type { DocDirection } from '@/types/editor';
import type { Theme } from '@/types/colors';

const ACTIVE_PRESET_KEY = 'marko-v2-active-preset';

export default function SettingsPage() {
  const [direction, setDirection] = useDocDirection();
  const [autoSave, setAutoSave] = useAutoSave();
  const [fontSize, setFontSize] = useFontSize();
  const [modePref, setModePref] = useDarkLightModePref();
  const { activeThemeId, setActiveThemeId } = useThemeSelection();
  const [colorTheme, setColorTheme] = useColorTheme();
  const [activePreset, setActivePreset] = useLocalStorage<string>(ACTIVE_PRESET_KEY, '');
  const { customPresets, deletePreset } = useCustomPresets();
  const { user: convexUser, isAuthenticated } = useCurrentUser();
  const { user: clerkUser } = useUser();
  const aiUsage = useQuery(api.usage.getMyMonthlyUsage, isAuthenticated ? {} : 'skip');

  // Convex settings sync
  const convexSettings = useQuery(api.userSettings.getMySettings, isAuthenticated ? {} : 'skip');
  const saveSettingsMutation = useMutation(api.userSettings.saveMySettings);
  const initialLoadDoneRef = useRef(false);
  const isHydratingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset load state on auth change (logout/re-login)
  useEffect(() => {
    if (!isAuthenticated) {
      initialLoadDoneRef.current = false;
    }
  }, [isAuthenticated]);

  // On mount: load settings from Convex for logged-in users (override localStorage)
  useEffect(() => {
    if (!isAuthenticated || initialLoadDoneRef.current) return;
    if (convexSettings === undefined) return; // Still loading

    initialLoadDoneRef.current = true;

    if (convexSettings === null) return; // No saved settings, keep localStorage defaults

    isHydratingRef.current = true;
    setDirection(convexSettings.docDirection);
    setAutoSave(convexSettings.autoSave);
    setFontSize(convexSettings.fontSize);
    setModePref(convexSettings.darkLightModePref);
    if (convexSettings.activeThemeId) {
      setActiveThemeId(convexSettings.activeThemeId);
    }
    // Allow React to batch state updates before enabling sync
    requestAnimationFrame(() => {
      isHydratingRef.current = false;
    });
  }, [isAuthenticated, convexSettings, setDirection, setAutoSave, setFontSize, setModePref, setActiveThemeId]);

  // Debounced save to Convex
  const syncToConvex = useCallback(() => {
    if (!isAuthenticated) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveSettingsMutation({
        docDirection: direction,
        autoSave,
        activeThemeId,
        darkLightModePref: modePref,
        fontSize,
      }).catch(() => {
        // Silent fail — settings are persisted locally, Convex sync is best-effort
      });
    }, 500);
  }, [isAuthenticated, saveSettingsMutation, direction, autoSave, activeThemeId, modePref, fontSize]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync whenever any setting changes (after initial load, skip during hydration)
  useEffect(() => {
    if (initialLoadDoneRef.current && !isHydratingRef.current) {
      syncToConvex();
    }
  }, [direction, autoSave, activeThemeId, modePref, fontSize, syncToConvex]);

  const handleDirectionChange = (dir: DocDirection) => {
    setDirection(dir);
  };

  const handleAutoSaveChange = () => {
    setAutoSave(!autoSave);
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
  };

  const handleModeChange = (pref: DarkLightModePref) => {
    setModePref(pref);
  };

  const handleCuratedThemeSelect = useCallback((theme: Theme) => {
    setColorTheme(theme.colors);
    setActiveThemeId(theme.id);
    setActivePreset('');
  }, [setColorTheme, setActiveThemeId, setActivePreset]);

  const userTier: 'free' | 'paid' | 'anonymous' | 'loading' = !isAuthenticated
    ? 'anonymous'
    : !convexUser
      ? 'loading'
      : convexUser.tier === 'paid' ? 'paid' : 'free';

  return (
    <main dir="rtl" lang="he" className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back link */}
        <Link
          href="/editor"
          className="inline-flex items-center gap-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="חזרה לעורך"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          <span>חזרה לעורך</span>
        </Link>

        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>

        {/* Editing Section */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5" aria-labelledby="settings-editing">
          <h2 id="settings-editing" className="text-lg font-bold text-foreground">עריכה</h2>

          {/* Direction radio group */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--foreground-muted)]">כיוון טקסט</legend>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="כיוון טקסט">
              {([
                { value: 'auto' as const, label: 'אוטומטי (BiDi)' },
                { value: 'rtl' as const, label: 'ימין לשמאל' },
                { value: 'ltr' as const, label: 'שמאל לימין' },
              ]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    direction === opt.value
                      ? 'border-[var(--primary)] bg-[var(--primary-ghost)] text-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="direction"
                    value={opt.value}
                    checked={direction === opt.value}
                    onChange={() => handleDirectionChange(opt.value)}
                    className="sr-only"
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Auto-save toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="auto-save" className="text-sm font-medium text-[var(--foreground-muted)]">
              שמירה אוטומטית
            </label>
            <button
              id="auto-save"
              type="button"
              role="switch"
              aria-checked={autoSave}
              onClick={handleAutoSaveChange}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                autoSave ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  autoSave ? '-translate-x-0.5' : '-translate-x-5'
                } mt-0.5`}
              />
            </button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5" aria-labelledby="settings-appearance">
          <h2 id="settings-appearance" className="text-lg font-bold text-foreground">מראה</h2>

          {/* Theme picker */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--foreground-muted)]">ערכת נושא</legend>
            <PresetGrid
              activePreset={activePreset}
              activeThemeId={activeThemeId}
              currentColors={colorTheme}
              userTier={userTier}
              onPresetSelect={(name, theme) => {
                setColorTheme(theme);
                setActivePreset(name);
                setActiveThemeId('');
              }}
              onCuratedThemeSelect={handleCuratedThemeSelect}
              onPremiumBlocked={() => {}}
              onPreview={applyColorTheme}
              customPresets={customPresets}
              onCustomPresetSelect={(colors) => {
                setColorTheme(colors);
                setActivePreset('');
                setActiveThemeId('');
              }}
              onDeleteCustomPreset={deletePreset}
            />
          </fieldset>

          {/* Dark/Light mode */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--foreground-muted)]">מצב תצוגה</legend>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="מצב תצוגה">
              {([
                { value: 'system' as const, label: 'מערכת' },
                { value: 'light' as const, label: 'אור' },
                { value: 'dark' as const, label: 'אפל' },
              ]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    modePref === opt.value
                      ? 'border-[var(--primary)] bg-[var(--primary-ghost)] text-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={opt.value}
                    checked={modePref === opt.value}
                    onChange={() => handleModeChange(opt.value)}
                    className="sr-only"
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Font size */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[var(--foreground-muted)]">גודל גופן</legend>
            <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="גודל גופן">
              {([
                { value: 'small' as const, label: 'קטן' },
                { value: 'medium' as const, label: 'בינוני' },
                { value: 'large' as const, label: 'גדול' },
              ]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    fontSize === opt.value
                      ? 'border-[var(--primary)] bg-[var(--primary-ghost)] text-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="fontSize"
                    value={opt.value}
                    checked={fontSize === opt.value}
                    onChange={() => handleFontSizeChange(opt.value)}
                    className="sr-only"
                    aria-label={opt.label}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* Account Section — logged-in only */}
        {isAuthenticated && convexUser && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4" aria-labelledby="settings-account">
            <h2 id="settings-account" className="text-lg font-bold text-foreground">חשבון</h2>

            <div className="space-y-3 text-sm">
              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--foreground-muted)]">דוא״ל</span>
                <span className="text-foreground">{clerkUser?.primaryEmailAddress?.emailAddress ?? '—'}</span>
              </div>

              {/* Name */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--foreground-muted)]">שם</span>
                <span className="text-foreground">
                  {[clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || '—'}
                </span>
              </div>

              {/* Subscription tier */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--foreground-muted)]">מנוי</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  convexUser.tier === 'paid'
                    ? 'bg-[var(--primary-ghost)] text-[var(--primary)]'
                    : 'bg-[var(--muted)] text-[var(--foreground-muted)]'
                }`}>
                  {convexUser.tier === 'paid' ? 'פרימיום' : 'חינם'}
                </span>
              </div>

              {/* AI Usage */}
              {aiUsage && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-[var(--primary)]" aria-hidden="true" />
                    <span className="text-[var(--foreground-muted)]">
                      {aiUsage.limit === null
                        ? 'שימוש ללא הגבלה'
                        : `${aiUsage.count} מתוך ${aiUsage.limit} פעולות AI החודש`
                      }
                    </span>
                  </div>
                  {aiUsage.limit !== null && (
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]" role="progressbar" aria-valuenow={aiUsage.count} aria-valuemin={0} aria-valuemax={aiUsage.limit} aria-label="שימוש ב-AI">
                      <div
                        className="h-full rounded-full bg-[var(--primary)] transition-all"
                        style={{ width: `${aiUsage.limit > 0 ? Math.min(100, (aiUsage.count / aiUsage.limit) * 100) : 0}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
