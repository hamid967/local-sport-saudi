import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "الخصوصية | الرياضة المحلية" }, { name: "description", content: "سياسة الخصوصية وفق نظام حماية البيانات الشخصية PDPL." }, { property: "og:title", content: "الخصوصية" }, { property: "og:description", content: "سياسة الخصوصية وفق نظام حماية البيانات الشخصية PDPL." }] }),
  component: () => (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">الخصوصية (PDPL)</h1>
      <p className="mb-3">نلتزم بأحكام نظام حماية البيانات الشخصية في المملكة العربية السعودية.</p>
      <ul className="list-disc ps-6 space-y-1 text-sm">
        <li>لا نجمع من بياناتك الشخصية إلا ما تحتاجه الخدمة (البريد، الاسم، الحجوزات).</li>
        <li>يُشفّر تخزين كلمات المرور ولا يمكن استرجاعها.</li>
        <li>لك الحق في الوصول لبياناتك وتعديلها وحذفها بالتواصل معنا.</li>
        <li>لا نشارك بياناتك مع أي طرف خارجي دون موافقتك.</li>
      </ul>
    </div>
  ),
});
