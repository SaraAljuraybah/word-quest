import { LoadingSpinner } from "./ui/LoadingSpinner";

export function AuthLoadingScreen() {
  return (
    <main className="grid min-h-[calc(100vh-81px)] place-items-center px-4 py-12">
      <LoadingSpinner label="جار التحقق من تسجيل الدخول" />
    </main>
  );
}
