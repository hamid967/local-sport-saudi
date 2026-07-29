import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  ar: {
    appName: "الرياضة المحلية",
    tagline: "منصة سعودية للرياضة المحلية",
    home: "الرئيسية",
    matches: "المباريات",
    competitions: "المسابقات",
    venues: "الملاعب",
    explore: "المستكشف",
    news: "الأخبار",
    myBookings: "حجوزاتي",
    favorites: "المفضلة",
    notifications: "الإشعارات",
    admin: "الإدارة",
    ownerPanel: "لوحة المالك",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    signUp: "إنشاء حساب",
    signInWithGoogle: "تسجيل الدخول بجوجل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    displayName: "الاسم",
    search: "بحث",
    live: "مباشر",
    finished: "منتهية",
    scheduled: "مجدولة",
    today: "اليوم",
    tomorrow: "غدًا",
    yesterday: "أمس",
    now: "الآن",
    week: "الأسبوع",
    month: "الشهر",
    year: "السنة",
    all: "الكل",
    region: "المنطقة",
    city: "المدينة",
    team: "الفريق",
    filter: "تصفية",
    demoBadge: "بيانات تجريبية",
    latestNews: "آخر الأخبار",
    liveMatches: "المباريات المباشرة",
    todayMatches: "مباريات اليوم",
    nearbyVenues: "ملاعب قريبة",
    standings: "الترتيب",
    topScorers: "الهدافون",
    lineups: "التشكيلات",
    events: "الأحداث",
    stats: "الإحصاءات",
    commentary: "التعليق",
    bookNow: "احجز الآن",
    pricePerHour: "ريال/ساعة",
    date: "التاريخ",
    time: "الوقت",
    duration: "المدة",
    hours: "ساعات",
    hour: "ساعة",
    total: "الإجمالي",
    confirm: "تأكيد",
    cancel: "إلغاء",
    loading: "جارٍ التحميل...",
    empty: "لا توجد نتائج",
    error: "حدث خطأ",
    retry: "إعادة المحاولة",
    saudiFootball: "كرة القدم السعودية المحلية",
    heroDesc: "نتائج مباشرة، جداول، ترتيب، حجز ملاعب، وكل ما يخص الرياضة داخل المملكة.",
    exploreVenues: "استكشف الملاعب",
    viewMatches: "شاهد المباريات",
    seasonSaudi: "موسم 2026",
    facilities: "المرافق",
    surface: "الأرضية",
    address: "العنوان",
    rating: "التقييم",
    matchdayN: "الجولة",
    minute: "د",
    goal: "هدف",
    yellowCard: "بطاقة صفراء",
    redCard: "بطاقة حمراء",
    substitution: "تبديل",
    penalty: "ركلة جزاء",
    reserveConfirmed: "تم تأكيد الحجز",
    reserveError: "تعذّر إتمام الحجز",
    bookingSlotTaken: "الوقت المختار محجوز مسبقًا",
    signInRequired: "يرجى تسجيل الدخول للمتابعة",
    footerNote: "منصة مستقلة — لا نستخدم شعارات أو محتوى أي جهة محمية.",
    contact: "تواصل معنا",
    privacy: "الخصوصية (PDPL)",
    about: "عن المنصة",
    upcoming: "القادمة",
    played: "لعب",
    wins: "فاز",
    draws: "تعادل",
    losses: "خسر",
    goalsFor: "له",
    goalsAgainst: "عليه",
    points: "النقاط",
    playersCount: "لاعبون",
    homeTeam: "المضيف",
    awayTeam: "الضيف",
  },
  en: {
    appName: "Local Sport",
    tagline: "Saudi local sports platform",
    home: "Home",
    matches: "Matches",
    competitions: "Competitions",
    venues: "Venues",
    explore: "Explore",
    news: "News",
    myBookings: "My Bookings",
    favorites: "Favorites",
    notifications: "Notifications",
    admin: "Admin",
    ownerPanel: "Owner Panel",
    signIn: "Sign in",
    signOut: "Sign out",
    signUp: "Sign up",
    signInWithGoogle: "Continue with Google",
    email: "Email",
    password: "Password",
    displayName: "Name",
    search: "Search",
    live: "LIVE",
    finished: "Finished",
    scheduled: "Scheduled",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    now: "Now",
    week: "Week",
    month: "Month",
    year: "Year",
    all: "All",
    region: "Region",
    city: "City",
    team: "Team",
    filter: "Filter",
    demoBadge: "Demo data",
    latestNews: "Latest news",
    liveMatches: "Live matches",
    todayMatches: "Today's matches",
    nearbyVenues: "Nearby venues",
    standings: "Standings",
    topScorers: "Top scorers",
    lineups: "Lineups",
    events: "Events",
    stats: "Stats",
    commentary: "Commentary",
    bookNow: "Book now",
    pricePerHour: "SAR/hour",
    date: "Date",
    time: "Time",
    duration: "Duration",
    hours: "hours",
    hour: "hour",
    total: "Total",
    confirm: "Confirm",
    cancel: "Cancel",
    loading: "Loading...",
    empty: "No results",
    error: "Something went wrong",
    retry: "Retry",
    saudiFootball: "Saudi Local Football",
    heroDesc: "Live scores, schedules, standings, venue booking — everything about local sport in Saudi Arabia.",
    exploreVenues: "Explore venues",
    viewMatches: "View matches",
    seasonSaudi: "Season 2026",
    facilities: "Facilities",
    surface: "Surface",
    address: "Address",
    rating: "Rating",
    matchdayN: "Matchday",
    minute: "'",
    goal: "Goal",
    yellowCard: "Yellow card",
    redCard: "Red card",
    substitution: "Sub",
    penalty: "Penalty",
    reserveConfirmed: "Booking confirmed",
    reserveError: "Booking failed",
    bookingSlotTaken: "This slot is already booked",
    signInRequired: "Please sign in to continue",
    footerNote: "Independent platform — no protected brand logos or content.",
    contact: "Contact",
    privacy: "Privacy (PDPL)",
    about: "About",
    upcoming: "Upcoming",
    played: "P",
    wins: "W",
    draws: "D",
    losses: "L",
    goalsFor: "GF",
    goalsAgainst: "GA",
    points: "Pts",
    playersCount: "Players",
    homeTeam: "Home",
    awayTeam: "Away",
  },
} as const;

type Key = keyof (typeof dict)["ar"];

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  dir: "rtl" | "ltr";
}>({ lang: "ar", setLang: () => {}, t: (k) => k as string, dir: "rtl" });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = (k: Key) => dict[lang][k] ?? (k as string);
  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
