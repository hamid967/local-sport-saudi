import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";

const APP_NAME = "الرياضة المحلية";
const SLUG = "saudi-sport-hub";

function CopyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
      <code dir="ltr" className="flex-1 overflow-x-auto whitespace-nowrap text-sm text-foreground">
        {value || "…"}
      </code>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={!value}
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className="ms-1">{copied ? "تم النسخ" : "نسخ"}</span>
      </Button>
    </div>
  );
}

function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-2 ps-5 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

function ConnectPage() {
  const [mcpUrl, setMcpUrl] = useState("");

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  const claudeLink = mcpUrl
    ? `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(APP_NAME)}&connectorUrl=${encodeURIComponent(mcpUrl)}`
    : "";
  const claudeCodeCmd = mcpUrl
    ? `claude mcp add --scope user --transport http ${SLUG} '${mcpUrl.replace(/'/g, "'\\''")}'`
    : "";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">ربط مساعد ذكي بالمنصة</h1>
      <p className="mb-6 text-muted-foreground">
        اربط ChatGPT أو Claude أو أي مساعد يدعم الخوادم البعيدة، ليتمكن من قراءة المباريات والترتيب والملاعب وإنشاء الحجوزات نيابةً عنك.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">رابط الخادم</CardTitle>
        </CardHeader>
        <CardContent>
          <CopyBox value={mcpUrl} />
          <p className="mt-2 text-xs text-muted-foreground">انسخ هذا الرابط والصقه في إعدادات المساعد.</p>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-xl font-semibold">خطوات الربط</h2>
      <Tabs defaultValue="chatgpt" className="mb-10">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
          <TabsTrigger value="other">مساعدات أخرى</TabsTrigger>
        </TabsList>

        <TabsContent value="chatgpt" className="pt-4">
          <Steps
            items={[
              <>افتح <a dir="ltr" className="text-primary underline" href="https://chatgpt.com/#settings/Connectors/Advanced" target="_blank" rel="noreferrer">إعدادات التطبيقات في ChatGPT</a> وفعّل وضع المطوّر (اقرأ تنبيه المخاطر المعروض). إن لم يكن الخيار متاحًا اطلب من مسؤول الحساب تفعيله.</>,
              "اضغط زر «Create app» بجانب زر الرجوع.",
              "اكتب اسمًا للربط والصق رابط الخادم أعلاه.",
              "اضغط «Create».",
              "فعّل التطبيق من شريط كتابة الرسالة، ثم اطلب من ChatGPT استخدامه.",
            ]}
          />
        </TabsContent>

        <TabsContent value="claude" className="pt-4">
          <Steps
            items={[
              <>افتح <a dir="ltr" className="text-primary underline" href={claudeLink || undefined} target="_blank" rel="noreferrer">نافذة إضافة موصّل مخصص في Claude</a> — الاسم والرابط معبّآن مسبقًا.</>,
              "راجع البيانات ثم اضغط «Add».",
              "إن لم تُفتح النافذة المعبّأة، افتح صفحة Connectors في Claude، اختر «Add custom connector»، ثم اكتب الاسم والصق رابط الخادم.",
              "فعّل الموصّل من شريط كتابة الرسالة، ثم اطلب من Claude استخدامه.",
            ]}
          />
        </TabsContent>

        <TabsContent value="claude-code" className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">شغّل هذا الأمر في الطرفية:</p>
          <CopyBox value={claudeCodeCmd} />
          <Steps
            items={[
              "شغّل الأمر أعلاه في الطرفية.",
              <>افتح Claude Code ثم شغّل <code dir="ltr">/mcp</code> للتأكد من الاتصال، وسجّل الدخول إن طُلب منك.</>,
              "اطلب من Claude Code استخدام المنصة.",
            ]}
          />
        </TabsContent>

        <TabsContent value="other" className="pt-4">
          <Steps
            items={[
              "افتح إعدادات خوادم MCP أو الموصّلات المخصصة في المساعد.",
              "أنشئ اتصال خادم بعيد جديد.",
              "اكتب اسمًا للاتصال والصق رابط الخادم أعلاه.",
              "أكمل أي خطوات تسجيل دخول أو تفويض.",
              "فعّل الاتصال ثم اطلب من المساعد استخدام المنصة.",
            ]}
          />
        </TabsContent>
      </Tabs>

      <h2 className="mb-3 text-xl font-semibold">تحديث الاتصال بعد تغيّر المنصة</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        يحتفظ المساعد بنسخة من قائمة الأدوات، لذا حدّث الاتصال بعد أي تحديث للمنصة.
      </p>
      <Tabs defaultValue="chatgpt-r">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="chatgpt-r">ChatGPT</TabsTrigger>
          <TabsTrigger value="claude-r">Claude</TabsTrigger>
          <TabsTrigger value="claude-code-r">Claude Code</TabsTrigger>
          <TabsTrigger value="other-r">مساعدات أخرى</TabsTrigger>
        </TabsList>

        <TabsContent value="chatgpt-r" className="pt-4">
          <Steps
            items={[
              "افتح إعدادات التطبيقات في ChatGPT واختر هذه المنصة من «Enabled apps».",
              "بجانب «Information» اضغط «Refresh».",
              "إن تغيّر الرابط، الصق الرابط الجديد من الأعلى.",
              "ابدأ محادثة جديدة واطلب استخدام المنصة.",
            ]}
          />
        </TabsContent>
        <TabsContent value="claude-r" className="pt-4">
          <Steps
            items={[
              "افتح صفحة Connectors واختر هذا الموصّل.",
              "حدّث قائمة أدوات الموصّل.",
              "إن تغيّر الرابط، الصق الرابط الجديد من الأعلى.",
              "اطلب من Claude استخدام المنصة.",
            ]}
          />
        </TabsContent>
        <TabsContent value="claude-code-r" className="pt-4">
          <Steps
            items={[
              "ابدأ جلسة جديدة في Claude Code لتحميل أحدث الأدوات.",
              <>إن تغيّر الرابط، شغّل <code dir="ltr">claude mcp remove {SLUG}</code> ثم أعد تشغيل أمر التثبيت بالرابط الجديد.</>,
              "اطلب من Claude Code استخدام المنصة.",
            ]}
          />
        </TabsContent>
        <TabsContent value="other-r" className="pt-4">
          <Steps
            items={[
              "افتح إعدادات خوادم MCP أو الموصّلات في المساعد.",
              "اختر الاتصال الخاص بهذه المنصة.",
              "حدّث قائمة الأدوات أو أعد تحميل الخادم.",
              "إن تغيّر الرابط، الصق الرابط الجديد من الأعلى.",
              "ابدأ محادثة جديدة واطلب استخدام المنصة.",
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "ربط مساعد ذكي | الرياضة المحلية" },
      { name: "description", content: "خطوات ربط ChatGPT أو Claude بمنصة الرياضة المحلية للوصول إلى المباريات والملاعب والحجوزات." },
      { property: "og:title", content: "ربط مساعد ذكي بالمنصة" },
      { property: "og:description", content: "خطوات ربط ChatGPT أو Claude بمنصة الرياضة المحلية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnectPage,
});