# Lovable Execution Phases

Use these prompts manually inside Lovable. Do not expose secrets in prompts.

## Phase A: Connect Supabase

اربط المشروع مع Supabase باستخدام `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`. استخدم الجداول الموجودة في `supabase/migrations` وانقل كل الواجهات من البيانات الثابتة إلى قاعدة البيانات.

## Phase B: Data Services

أنشئ طبقة `src/lib/supabase.ts` و `src/services/*` و React hooks لكل نطاق: sports, geography, competitions, teams, matches, venues, bookings, articles, notifications.

## Phase C: Booking Flow

فعّل حجز الملاعب من `venue_slots` و `bookings` مع منع double booking من قاعدة البيانات، وعرض رسائل واضحة عند تعارض الحجز.

## Phase D: Editorial CMS

فعّل المقالات والوسائط للمحررين والمديرين فقط، مع عرض الأخبار للمستخدمين حسب الرياضة والمنطقة والمدينة.
