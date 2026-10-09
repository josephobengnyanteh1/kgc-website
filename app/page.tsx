import Link from "next/link";
import BranchPicker from "@/components/BranchPicker";
import { BRANCHES } from "@/lib/branches";
import { hasSupabase, supabase } from "@/lib/supabase";
export const revalidate = 60;
type Post = { id: string; title: string; body: string | null; created_at: string; branches: { name: string; city: string } | null };
async function load(): Promise<Post[]> {
  if (!hasSupabase) return [];
  try {
    const { data } = await supabase().from("announcements").select("id,title,body,created_at,branches(name,city)").order("created_at", { ascending: false }).limit(12);
    return (data as unknown as Post[]) ?? [];
  } catch { return []; }
}
export default async function Home() {
  const posts = await load();
  const global = posts.filter((p) => !p.branches);
  const local = posts.filter((p) => p.branches);
  return (<main className="wrap">
    <div className="bar"><img src="/logo.jpg" alt="Kingdom Glory Church" /><BranchPicker /></div>
    <section className="hero">
      <img src="/logo.jpg" alt="" />
      <h1 className="shine">One church, four branches</h1>
      <p>Pick your branch to see its announcements, watch live services, give and join.</p>
    </section>
    <h2>From all branches</h2>
    <div style={{ margin: "16px 0 40px" }}>
      {global.length === 0 && <p style={{ color: "var(--mute)" }}>No announcements yet. Media team: post one from the admin panel.</p>}
      {global.map((p) => <article className="news" key={p.id}><h3>{p.title}</h3><p>{p.body}</p></article>)}
    </div>
    <h2>Your branch</h2>
    <div className="grid">
      {BRANCHES.map((b) => <Link className="door" key={b.slug} href={`/${b.slug}`}><h3>{b.name}</h3><span>{b.city}, {b.country}</span></Link>)}
    </div>
    {local.length > 0 && <><h2>Branch news</h2><div style={{ margin: "16px 0 60px" }}>
      {local.map((p) => <article className="news" key={p.id}><small>{p.branches!.name}, {p.branches!.city}</small><h3>{p.title}</h3><p>{p.body}</p></article>)}
    </div></>}
  </main>);
}
