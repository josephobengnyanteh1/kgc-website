import { notFound } from "next/navigation";
import Link from "next/link";
import BranchPicker from "@/components/BranchPicker";
import { findBranch } from "@/lib/branches";
export default function Branch({ params }: { params: { branch: string } }) {
  const b = findBranch(params.branch);
  if (!b) notFound();
  return (<main className="wrap">
    <div className="bar"><Link href="/"><img src="/logo.jpg" alt="Kingdom Glory Church home" /></Link><BranchPicker /></div>
    <section className="hero"><h1>Kingdom Glory Church<br />{b.name}</h1><p>{b.city}, {b.country}</p></section>
    <p style={{ color: "var(--mute)", textAlign: "center" }}>Branch announcements, streams, giving and sign-in come next.</p>
  </main>);
}
