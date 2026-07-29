import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/site/empty-state";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "بحث | الرياضة المحلية" }, { name: "description", content: "بحث عام في الفرق والملاعب والمسابقات." }, { property: "og:title", content: "بحث" }, { property: "og:description", content: "بحث عام." }] }),
  component: () => {
    const { t, lang } = useI18n();
    const [q, setQ] = useState("");
    const results = useQuery({
      queryKey: ["search", q],
      enabled: q.length > 1,
      queryFn: async () => {
        const like = `%${q}%`;
        const [teams, venues, comps] = await Promise.all([
          supabase.from("teams").select("id, name_ar, name_en").or(`name_ar.ilike.${like},name_en.ilike.${like}`).limit(10),
          supabase.from("venues").select("id, name_ar, name_en").or(`name_ar.ilike.${like},name_en.ilike.${like}`).limit(10),
          supabase.from("competitions").select("id, name_ar, name_en").or(`name_ar.ilike.${like},name_en.ilike.${like}`).limit(10),
        ]);
        return { teams: teams.data ?? [], venues: venues.data ?? [], comps: comps.data ?? [] };
      },
    });
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t("search")}</h1>
        <Input placeholder="ابحث عن فريق، ملعب، مسابقة..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-6" autoFocus />
        {q.length <= 1 ? <p className="text-sm text-muted-foreground">اكتب حرفين على الأقل</p> : (
          <div className="space-y-6">
            <Section title={t("competitions")} items={(results.data?.comps ?? []).map((c) => ({ id: c.id, name: lang === "ar" ? c.name_ar : c.name_en, to: `/competitions/${c.id}` }))} />
            <Section title={t("team")} items={(results.data?.teams ?? []).map((c) => ({ id: c.id, name: lang === "ar" ? c.name_ar : c.name_en, to: `/teams/${c.id}` }))} />
            <Section title={t("venues")} items={(results.data?.venues ?? []).map((c) => ({ id: c.id, name: lang === "ar" ? c.name_ar : c.name_en, to: `/venues/${c.id}` }))} />
          </div>
        )}
      </div>
    );
  },
});

function Section({ title, items }: { title: string; items: { id: string; name: string; to: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="space-y-1">{items.map((i) => <li key={i.id}><Link to={i.to} className="block rounded-md border border-border p-2 bg-card hover:border-primary/40">{i.name}</Link></li>)}</ul>
    </section>
  );
}
