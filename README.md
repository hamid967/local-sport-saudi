# الرياضة المحلية | Local Sport

منصة سعودية محلية لمتابعة الرياضة داخل المملكة فقط، تبدأ بكرة القدم المحلية ثم تتوسع لباقي الرياضات. الهدف هو بناء تجربة مشابهة في العمق الوظيفي لمنصات النتائج الرياضية الكبرى، مع محتوى وبيانات وحقوق مستقلة بالكامل.

**Live app:** https://local-sport-saudi.lovable.app  
**Lovable project:** https://lovable.dev/projects/f4f768b4-eba7-4194-b216-157ab995e468

## النطاق الأساسي

- متابعة مباريات الآن واليوم والأسبوع والشهر والسنة.
- مسابقات ومواسم وفرق ولاعبون وترتيب وإحصاءات.
- تغطية السعودية حسب المنطقة والمدينة والحي.
- دليل ملاعب وحجز أوقات متاحة بالقرب من المستخدم.
- أخبار ومقالات وإعلام رياضي محلي.
- حسابات وأدوار: مستخدم، مالك ملعب، محرر، مدير منطقة، مدير نظام.
- لوحة إدارة للبيانات الرياضية والملاعب والحجوزات والمحتوى.

## Stack

- Frontend: React, TypeScript, Tailwind, shadcn/ui
- Backend/Data: Supabase PostgreSQL
- Auth: Supabase Auth
- Database: UUID primary keys, timestamps, relational constraints, indexes, RLS-ready policies

## Environment

Create `.env.local` from `.env.example` and fill values from Supabase:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit real keys or service-role secrets.

## Supabase Setup

Apply migrations in order:

```bash
supabase db push
supabase db seed
```

Important files:

- `supabase/migrations/202607300001_initial_schema.sql`
- `supabase/seed.sql`

## Development

```bash
npm i
npm run dev
npm run build
npm run lint
```

## Data Model

The schema includes:

`sports`, `regions`, `cities`, `neighborhoods`, `competitions`, `seasons`, `teams`, `players`, `team_memberships`, `venues`, `venue_facilities`, `venue_slots`, `matches`, `match_events`, `lineups`, `standings`, `bookings`, `profiles`, `roles`, `favorites`, `notifications`, `articles`, `media_assets`, `audit_logs`.

## المرحلة التالية في Lovable

بعد ربط Supabase وتشغيل migration والseed، اطلب من Lovable نقل الواجهات من البيانات الثابتة إلى الجداول الحقيقية، ثم بناء طبقة services/hooks موحدة لكل شاشة.
