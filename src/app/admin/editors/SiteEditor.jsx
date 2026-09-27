"use client";

import { navToText, textToNav } from "../format/site";
import { boxCls, hintCls, inputCls } from "../format/ui";
import ImageInput from "../components/ImageInput";

const PROFILE_FIELDS = [
  ["name", "Name"],
  ["handle", "Handle"],
  ["role", "Role"],
  ["headline", "Headline"],
  ["email", "Email"],
  ["location", "Location"],
  ["resumeUrl", "Resume URL"],
];

const SOCIALS = ["github", "linkedin", "facebook", "telegram", "whatsapp", "instagram"];

export default function SiteEditor({ data, onChange }) {
  const set = (patch) => onChange({ ...data, ...patch });
  const setProfile = (patch) => set({ profile: { ...data.profile, ...patch } });
  const setSocial = (k, v) =>
    set({ profile: { ...data.profile, socials: { ...(data.profile?.socials || {}), [k]: v } } });
  const p = data.profile || {};
  const s = p.socials || {};
  return (
    <div className="space-y-3">
      <p className={hintCls}>Normal text — no JSON needed. Nav: <code>Home | #home</code></p>
      {PROFILE_FIELDS.map(([k, label]) => (
        <label key={k} className="block">
          <span className="text-sm font-medium text-zinc-300">{label}</span>
          <input value={p[k] || ""} onChange={(e) => setProfile({ [k]: e.target.value })} className={inputCls} />
        </label>
      ))}
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Short value / bio</span>
        <textarea value={p.value || ""} onChange={(e) => setProfile({ value: e.target.value })} rows={3} className={inputCls} />
      </label>
      <div className="block">
        <span className="text-sm font-medium text-zinc-300">Profile image URL + Upload</span>
        <ImageInput value={p.profileImage || ""} onChange={(url) => setProfile({ profileImage: url })} />
      </div>
      <div className={boxCls}>
        <p className="text-sm font-medium text-zinc-300">Social links</p>
        {SOCIALS.map((k) => (
          <label key={k} className="block">
            <span className="text-xs capitalize text-zinc-400">{k}</span>
            <input value={s[k] || ""} onChange={(e) => setSocial(k, e.target.value)} className={inputCls} placeholder={`https://… (${k})`} />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-medium text-zinc-300">Navigation (one per line)</span>
        <textarea value={navToText(data.nav)} onChange={(e) => set({ nav: textToNav(e.target.value) })} rows={5} className={`${inputCls} font-mono text-sm`} />
      </label>
    </div>
  );
}
