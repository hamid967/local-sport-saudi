# Saudi Sport Hub

أنشئ تطبيقًا إنتاجيًا full-stack باسم "الرياضة المحلية | Local Sport"، منصة سعودية متخصصة حصريًا في الرياضة داخل المملكة. استلهم عمق وظائف منصات النتائج الكبرى مثل Kooora من دون نسخ التصميم أو المحتوى أو العلامات المحمية.

ابدأ بالمرحلة الأولى العاملة لكرة القدم السعودية، مع قابلية إضافة جميع الرياضات. استخدم TypeScript وReact وTailwind وshadcn/ui وPostgreSQL. الواجهة عربية RTL افتراضيًا مع English LTR، متجاوبة للجوال وسطح المكتب، بهوية أخضر سعودي وأبيض وفحمي، وحالات loading/empty/error ووصول WCAG AA.

ابنِ تطبيقًا وظيفيًا لا صفحة تسويقية، ويشمل:
- الرئيسية: مباريات الآن واليوم، مسابقات، أخبار محلية، ملاعب قريبة.
- مركز مباريات بتبويبات الآن/اليوم/غدًا/الأسبوع/الشهر/السنة، تقويم وفلاتر الرياضة والمنطقة والمدينة والمسابقة والفريق.
- تفاصيل المباراة قبل/أثناء/بعد: النتيجة والوقت والملعب والتشكيلة والأحداث والإحصاءات والتعليق الزمني.
- صفحات المسابقات والفرق واللاعبين والترتيب والهدافين.
- مستكشف المملكة > المنطقة > المدينة > الحي للفرق والبطولات والمباريات والملاعب.
- دليل ملاعب بقائمة وخريطة وفلاتر القرب والسعر والأرضية والمرافق والتقييم والأوقات المتاحة.
- حجز ملعب كامل: تاريخ وفترة ومدة وسعر ومراجعة وتأكيد تجريبي وصفحة حجوزاتي، من دون دفع حقيقي الآن.
- بحث عام، مفضلة، إشعارات، مصادقة، وأدوار: مستخدم ومالك ملعب ومحرر ومدير منطقة ومدير نظام.
- لوحة إدارة لإدارة الرياضات والمناطق والمدن والأحياء والمسابقات والفرق والمباريات والملاعب وحالات الاعتماد.

أنشئ نموذج بيانات قابلًا للتوسع يشمل sports, regions, cities, neighborhoods, competitions, seasons, teams, players, team_memberships, venues, venue_facilities, venue_slots, matches, match_events, standings, bookings, profiles, roles, favorites, notifications, articles, media_assets, audit_logs. استخدم UUID وفهارس وسياسات وصول حسب الدور وعزل بيانات مالك الملعب. امنع double booking بقيد قاعدة بيانات ومعاملة ذرية، وافصل sports data provider خلف adapter لربط API مرخص لاحقًا.

استخدم seed data سعودية خيالية تغطي عدة مناطق ومدن وأحياء ومباريات مباشرة ومجدولة ومكتملة وملاعب متاحة، مع شارة واضحة "بيانات تجريبية". لا تنفذ scraping ولا تستخدم شعارات أو محتوى Kooora أو الأندية. راعِ PDPL وسجل audit log للإدارة.

معايير القبول: كل المسارات والأزرار والفلاتر والبحث والتقويم والحجز تعمل، RTL/LTR دون قص عند 375px و1440px، build وlint ناجحان، وREADME يشرح البنية والبيانات والمتغيرات وخطوات المرحلة التالية. في النهاية اعرض ملخص المنجز والجداول والمسارات وما بقي. لا تربط الدفع أو مزود نتائج خارجي قبل المفاتيح والتعاقدات.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://local-sport-saudi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4f768b4-eba7-4194-b216-157ab995e468).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
