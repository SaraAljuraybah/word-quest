import { BadgeCheck, Crown, Gamepad2, Shield, Sparkles, Trophy } from "lucide-react";

export const features = [
  {
    title: "تحديات يومية",
    description: "كلمات جديدة كل يوم مع محاولات ذكية ونقاط تعكس دقتك.",
    icon: Sparkles,
  },
  {
    title: "نظام تقدم واضح",
    description: "اجمع النقاط، ارتق بالمستوى، وافتح مزايا تجعل كل جولة أمتع.",
    icon: Trophy,
  },
  {
    title: "متجر تعزيزات",
    description: "استخدم نقاطك لكشف حرف، حذف اختيار خاطئ، أو الحصول على فرصة إضافية.",
    icon: Crown,
  },
  {
    title: "حساب آمن",
    description: "تسجيل دخول وحفظ تقدمك عبر Supabase بدون تعقيد.",
    icon: Shield,
  },
];

export const steps = [
  "خمّن الكلمة خلال ست محاولات.",
  "راقب ألوان الحروف لتعرف موقعها الصحيح.",
  "اكسب نقاطا أكثر عندما تصل للحل بسرعة.",
];

export const previewRows = [
  [
    { letter: "س", state: "correct" },
    { letter: "ل", state: "present" },
    { letter: "ا", state: "empty" },
    { letter: "م", state: "empty" },
    { letter: "ة", state: "empty" },
  ],
  [
    { letter: "ق", state: "absent" },
    { letter: "ل", state: "correct" },
    { letter: "ع", state: "present" },
    { letter: "ة", state: "empty" },
    { letter: "م", state: "empty" },
  ],
  [
    { letter: "ع", state: "correct" },
    { letter: "ل", state: "correct" },
    { letter: "م", state: "correct" },
    { letter: "ا", state: "empty" },
    { letter: "ت", state: "empty" },
  ],
];

export const stats = [
  { label: "محاولة", value: "6" },
  { label: "نقاط للفوز السريع", value: "100" },
  { label: "تعزيزات", value: "5" },
];

export const appHighlights = [
  { label: "واجهة عربية بالكامل", icon: BadgeCheck },
  { label: "تجربة لعب أنيقة", icon: Gamepad2 },
];
