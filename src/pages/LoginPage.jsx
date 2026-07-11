import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, LockKeyhole } from "lucide-react";
import { resetPassword } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Toast } from "../components/ui/Toast";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(
    location.state?.authMessage
      ? { tone: location.state.authTone || "error", message: location.state.authMessage }
      : null
  );

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setToast(null);

    const { error } = await signIn(form);

    setIsLoading(false);

    if (error) {
      setToast({ tone: "error", message: "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور." });
      return;
    }

    navigate("/stages", { replace: true });
  }

  async function handleForgotPassword() {
    if (!form.email) {
      setToast({ tone: "error", message: "أدخل بريدك الإلكتروني أولا." });
      return;
    }

    const { error } = await resetPassword(form.email);
    setToast(
      error
        ? { tone: "error", message: "تعذر إرسال رابط استعادة كلمة المرور." }
        : { tone: "success", message: "تم إرسال رابط استعادة كلمة المرور." }
    );
  }

  return (
    <main className="grid min-h-[calc(100vh-81px)] place-items-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">تسجيل الدخول</h1>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
            عد إلى حسابك وتابع تقدمك في ورد كويست.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
            placeholder="••••••••"
            required
          />

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            onClick={handleForgotPassword}
          >
            <Mail className="h-4 w-4" />
            نسيت كلمة المرور؟
          </button>

          <Toast message={toast?.message} tone={toast?.tone} />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner label="جار تسجيل الدخول" /> : "دخول"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
          ليس لديك حساب؟{" "}
          <Link className="text-primary" to="/register">
            إنشاء حساب جديد
          </Link>
        </p>
      </Card>
    </main>
  );
}
