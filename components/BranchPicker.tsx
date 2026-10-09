"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BRANCHES } from "@/lib/branches";
const KEY = "kgc_branch";
export default function BranchPicker({ label = "Change branch" }: { label?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!document.cookie.includes(KEY + "=") && !sessionStorage.getItem("kgc_skipped")) ref.current?.showModal();
  }, []);
  const choose = (slug: string) => {
    document.cookie = `${KEY}=${slug}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${slug}`);
  };
  return (<>
    <button className="btn ghost" onClick={() => ref.current?.showModal()}>{label}</button>
    <dialog ref={ref} aria-labelledby="pick-title">
      <h2 id="pick-title">Choose your branch</h2>
      <p style={{ color: "var(--mute)" }}>We will take you to your branch's page with its announcements, streams and giving.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {BRANCHES.map((b) => <button key={b.slug} className="btn ghost" onClick={() => choose(b.slug)}>{b.name}, {b.city}</button>)}
      </div>
      <p><button className="btn ghost" onClick={() => { sessionStorage.setItem("kgc_skipped", "1"); ref.current?.close(); }}>Stay on the homepage</button></p>
    </dialog>
  </>);
}
