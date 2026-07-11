import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Toast } from "../components/ui/Toast";

function getSignupErrorMessage(error) {
  const message = error?.message || "";
  const code = error?.code || "";
  const normalizedMessage = message.toLowerCase();

  if (message.includes("User already registered")) {
    return {
      message: "هذا البريد مسجل مسبقًا، جرّب تسجيل الدخول",
      isExistingEmail: true,
    };
  }

  if (code === "email_exists") {
    return {
      message: "هذا البريد مستخدم بالفعل",
      isExistingEmail: true,
    };
  }

  if (
    normalizedMessage.includes("password") ||
    normalizedMessage.includes("weak") ||
    normalizedMessage.includes("too short")
  ) {
    return {
      message: "كلمة المرور لا تستوفي المتطلبات",
      isExistingEmail: false,
    };
  }

  return {
    message: import.meta.env.DEV && message ? message : "تعذر إنشاء الحساب",
    isExistingEmail: false,
  };
}

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLoginLink, setShowLoginLink] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setToast(null);
    setShowLoginLink(false);

    const { error } = await signUp(form);

    setIsLoading(false);

    if (error) {
      const signupError = getSignupErrorMessage(error);
      setToast({ tone: "error", message: signupError.message });
      setShowLoginLink(signupError.isExistingEmail);
      return;
    }

    navigate("/stages", { replace: true });
  }

  return (
    <main className="grid min-h-[calc(100vh-81px)] place-items-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold">
            <UserPlus className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">إنشاء حساب</h1>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            افتح ملفك واحفظ نقاطك ومستواك في كل جولة.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="الاسم"
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            placeholder="اسم اللاعب"
            required
          />
          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="name@example.com"
            required
          />
          <Input
            label="كلمة المرور"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="ثمانية أحرف أو أكثر"
            minLength="8"
            required
          />

          <Toast message={toast?.message} tone={toast?.tone} />

          {showLoginLink ? (
            <Button as={Link} to="/login" type="button" variant="secondary" className="w-full">
              الانتقال إلى تسجيل الدخول
            </Button>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner label="جار إنشاء الحساب" /> : "إنشاء الحساب"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
          لديك حساب بالفعل؟{" "}
          <Link className="text-primary" to="/login">
            تسجيل الدخول
          </Link>
        </p>
      </Card>
    </main>
  );
}
