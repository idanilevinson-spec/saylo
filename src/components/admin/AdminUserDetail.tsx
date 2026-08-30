"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase/browserClient";
import { useAuth } from "@/context/AuthProvider";
import StatusBadge from "@/components/admin/StatusBadge";
import type { AgeBand, GuardianLink, Profile, Streak, Subscription, UserXp } from "@/types/database";

const AGE_BAND_LABELS: Record<AgeBand, string> = { child: "ילד/ה", teen: "נוער", adult: "מבוגר/ת" };
const CONSENT_LABELS: Record<string, string> = {
  not_required: "לא נדרש",
  pending: "ממתין",
  granted: "אושר",
  denied: "נדחה",
};

interface DetailState {
  profile: Profile;
  subscription: Subscription | null;
  xp: UserXp | null;
  streak: Streak | null;
  guardianLinks: GuardianLink[];
}

export default function AdminUserDetail({ profileId }: { profileId: string }) {
  const { profile: currentAdmin } = useAuth();
  const [state, setState] = useState<DetailState | null | "not_found">(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  async function load() {
    const [{ data: profile }, { data: subscription }, { data: xp }, { data: streak }, { data: guardianLinks }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("profile_id", profileId).maybeSingle(),
        supabase.from("user_xp").select("*").eq("profile_id", profileId).maybeSingle(),
        supabase.from("streaks").select("*").eq("profile_id", profileId).maybeSingle(),
        supabase.from("guardian_links").select("*").eq("minor_profile_id", profileId),
      ]);

    if (!profile) {
      setState("not_found");
      return;
    }
    setState({ profile, subscription, xp, streak, guardianLinks: guardianLinks ?? [] });
  }

  async function toggleAdmin() {
    if (state === null || state === "not_found" || !currentAdmin) return;
    const nextValue = !state.profile.is_admin;
    const confirmed = window.confirm(
      nextValue
        ? `להעניק הרשאות ניהול ל-${state.profile.display_name}?`
        : `להסיר הרשאות ניהול מ-${state.profile.display_name}?`
    );
    if (!confirmed) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").update({ is_admin: nextValue }).eq("id", profileId);
    if (!error) {
      await supabase.from("admin_audit_log").insert({
        admin_profile_id: currentAdmin.id,
        action: nextValue ? "grant_admin" : "revoke_admin",
        target_type: "profile",
        target_id: profileId,
      });
      await load();
    }
    setSaving(false);
  }

  if (state === null) return <p className="text-muted">טוען...</p>;
  if (state === "not_found") return <p className="text-muted">משתמש לא נמצא.</p>;

  const { profile, subscription, xp, streak, guardianLinks } = state;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-card-border rounded-2xl p-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {profile.display_name}
            {profile.is_admin && <span className="ms-2 text-sm text-accent-hover font-bold">מנהל</span>}
          </h2>
          <p className="mt-1 text-sm text-muted">
            גיל {profile.age} · {AGE_BAND_LABELS[profile.age_band]} · נרשם/ה ב-
            {new Date(profile.created_at).toLocaleDateString("he-IL")}
          </p>
        </div>
        <button
          onClick={toggleAdmin}
          disabled={saving || profile.id === currentAdmin?.id}
          title={profile.id === currentAdmin?.id ? "לא ניתן להסיר הרשאות ניהול מעצמך" : undefined}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-card-border hover:bg-background-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {profile.is_admin ? "הסרת הרשאות ניהול" : "הענקת הרשאות ניהול"}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <p className="text-sm text-muted">מנוי</p>
          <p className="mt-2">{subscription ? <StatusBadge status={subscription.status} /> : "אין"}</p>
          {subscription?.trial_ends_at && (
            <p className="mt-2 text-xs text-muted">
              ניסיון עד {new Date(subscription.trial_ends_at).toLocaleDateString("he-IL")}
            </p>
          )}
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <p className="text-sm text-muted">ניקוד ורמה</p>
          <p className="mt-2 text-2xl font-bold">{xp?.total_xp ?? 0} XP</p>
          <p className="text-xs text-muted">רמה {xp?.current_level ?? 1}</p>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <p className="text-sm text-muted">רצף</p>
          <p className="mt-2 text-2xl font-bold flex items-center gap-1.5">
            {streak?.current_streak ?? 0} <Flame size={18} className="fill-current text-accent-hover" />
          </p>
          <p className="text-xs text-muted">שיא: {streak?.longest_streak ?? 0}</p>
        </div>
      </div>

      {profile.age_band !== "adult" && (
        <div className="bg-card border border-card-border rounded-2xl p-6">
          <h3 className="font-bold">אישור הורים</h3>
          <p className="mt-1 text-sm text-muted">
            סטטוס נוכחי: {CONSENT_LABELS[profile.parental_consent_status] ?? profile.parental_consent_status}
          </p>
          {guardianLinks.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {guardianLinks.map((link) => (
                <li key={link.id} className="flex items-center gap-2">
                  <span className="text-muted">{link.guardian_email}</span>
                  <StatusBadge status={link.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
