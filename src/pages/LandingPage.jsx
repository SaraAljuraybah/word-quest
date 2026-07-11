import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { appHighlights, features, stats, steps } from "../constants/landing";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { GamePreview } from "../components/GamePreview";
import { PageContainer } from "../components/PageContainer";

export function LandingPage() {
  return (
    <>
      <PageContainer className="relative overflow-hidden pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="absolute left-4 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />

        <section className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <Sparkles className="h-4 w-4" />
              تجربة كلمات عربية بمستوى منتج عالمي
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black leading-[1.08] tracking-normal text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                ورد كويست
              </h1>
              <p className="max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
                لعبة تخمين كلمات عربية مصممة لتكون سريعة، أنيقة، وتنافسية. خمّن الكلمة، اجمع
                النقاط، وافتح تعزيزات تساعدك في الجولات الصعبة.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register" className="text-base">
                ابدأ الآن
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button as={Link} to="/game" variant="secondary" className="text-base">
                <Play className="h-5 w-5" />
                معاينة التجربة
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="rounded-3xl p-4 shadow-none">
                  <p className="text-3xl font-black text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <GamePreview />
          </motion.div>
        </section>
      </PageContainer>

      <section className="border-y border-slate-200/80 bg-white/70 py-16 dark:border-white/10 dark:bg-white/[0.03]">
        <PageContainer>
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black text-primary">لماذا ورد كويست؟</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">
                كل ما تحتاجه لتجربة كلمات ممتعة
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {appHighlights.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-none">
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-primary text-white dark:bg-primary">
            <p className="text-sm font-black text-violet-100">كيف تعمل؟</p>
            <h2 className="mt-3 text-4xl font-black">ثلاث خطوات فقط</h2>
            <p className="mt-4 leading-8 text-violet-100">
              صممنا التجربة لتكون واضحة من أول جولة، مع مساحة كافية للمهارة والتحدي.
            </p>
          </Card>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Card key={step} className="flex items-center gap-5 shadow-none">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-lg font-black text-slate-950">
                  {index + 1}
                </span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{step}</p>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 px-6 py-12 text-center shadow-premium dark:bg-white/[0.06]">
          <p className="text-sm font-black text-gold">جاهز للجولة الأولى؟</p>
          <h2 className="mt-3 text-4xl font-black text-white">ابدأ رحلتك في ورد كويست</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
            أنشئ حسابك الآن واحفظ تقدمك ونقاطك على كل جهاز.
          </p>
          <Button as={Link} to="/register" variant="gold" className="mt-8">
            إنشاء حساب
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
        ورد كويست، تجربة كلمات عربية حديثة.
      </footer>
    </>
  );
}
