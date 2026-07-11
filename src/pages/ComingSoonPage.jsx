import { Construction } from "lucide-react";
import { PageContainer } from "../components/PageContainer";
import { Card } from "../components/ui/Card";

export function ComingSoonPage({ title }) {
  return (
    <PageContainer className="grid min-h-[calc(100vh-81px)] place-items-center py-12">
      <Card className="max-w-xl text-center">
        <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <Construction className="h-8 w-8" />
        </span>
        <p className="text-sm font-black text-primary">قريبا</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-4 leading-8 text-slate-600 dark:text-slate-300">
          تم تجهيز المسار والواجهة الأساسية. سنبني هذه الصفحة في المرحلة التالية بدون إضافة
          منطق اللعبة الآن.
        </p>
      </Card>
    </PageContainer>
  );
}
