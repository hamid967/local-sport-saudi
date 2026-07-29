import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "عن المنصة | الرياضة المحلية" }, { name: "description", content: "منصة سعودية مستقلة للرياضة المحلية." }, { property: "og:title", content: "عن المنصة" }, { property: "og:description", content: "منصة سعودية مستقلة للرياضة المحلية." }] }),
  component: () => (
    <div className="container mx-auto max-w-3xl px-4 py-10 prose prose-neutral rtl:prose-p:text-start">
      <h1 className="text-3xl font-bold mb-4">عن المنصة</h1>
      <p className="mb-3">الرياضة المحلية منصة سعودية مستقلة تُعنى بكل ما يخص الرياضة داخل المملكة: نتائج المباريات، جداول المسابقات، الملاعب المحلية وحجزها.</p>
      <p className="mb-3">لا نستخدم شعارات أو محتوى محمية لأي جهة أخرى، وكل البيانات المعروضة حاليًا هي بيانات تجريبية مصممة لعرض قدرات المنصة.</p>
      <p>عند اكتمال التعاقدات مع مزوّدي البيانات الرسميين، سيتم استبدال البيانات التجريبية بمعلومات مباشرة عبر واجهات ربط رسمية.</p>
    </div>
  ),
});
