import { Eye, Eraser, Palette, PlusCircle, Shuffle } from "lucide-react";

export const STORE_ITEMS = [
  {
    key: "reveal_letter",
    name: "كشف حرف",
    englishName: "Reveal Letter",
    description: "يكشف لك حرفا صحيحا في الجولة. التفعيل سيضاف لاحقا.",
    cost: 300,
    icon: Eye,
  },
  {
    key: "remove_wrong_letter",
    name: "حذف حرف خاطئ",
    englishName: "Remove Wrong Letter",
    description: "يساعدك على حذف اختيار غير صحيح من لوحة المفاتيح لاحقا.",
    cost: 250,
    icon: Eraser,
  },
  {
    key: "extra_attempt",
    name: "محاولة إضافية",
    englishName: "Extra Attempt",
    description: "يمنحك فرصة إضافية في جولة مستقبلية عند تفعيل القوى.",
    cost: 500,
    icon: PlusCircle,
  },
  {
    key: "new_word",
    name: "كلمة جديدة",
    englishName: "New Word",
    description: "استبدل الكلمة الحالية عند تفعيل استخدام العناصر لاحقا.",
    cost: 700,
    icon: Shuffle,
  },
  {
    key: "custom_theme",
    name: "ثيم خاص",
    englishName: "Custom Theme",
    description: "افتح مظهرا خاصا للعبة في مرحلة الثيمات القادمة.",
    cost: 1500,
    icon: Palette,
  },
];

export function getStoreItem(itemKey) {
  return STORE_ITEMS.find((item) => item.key === itemKey);
}
