"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SUCCESS_COPY, TALENT_STAGES } from "@/lib/content";
import { Logo } from "@/components/brand/Logo";
import { ArrowLeft, GoldRule } from "@/components/ui/Primitives";
import Link from "next/link";
import { shortId } from "@/lib/utils";

/** شاشة بعد الإرسال — تجربة علامة، لا رسالة «Success!» */
export function SuccessScreen({ submissionId }: { submissionId: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="form-shell pb-24 pt-10 sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-line bg-ivory-50 p-6 shadow-elev sm:p-10"
      >
        {/* قوس ذهبي هادئ كتوقيع بصري */}
        <motion.div
          aria-hidden
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute -start-24 -top-24 h-72 w-72 rounded-full border border-gold/40"
        />
        <motion.div
          aria-hidden
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute -start-10 -top-10 h-72 w-72 rounded-full border border-gold/30"
        />

        <div className="relative">
          <Logo href={null} size={44} showWordmark={false} />

          <h1 className="mt-7 text-[30px] font-semibold leading-snug text-navy sm:text-[36px]">
            {SUCCESS_COPY.title}
          </h1>
          <p className="mt-4 max-w-prose text-[16.5px] leading-9 text-ink-soft">{SUCCESS_COPY.line1}</p>
          <p className="mt-4 max-w-prose text-[15px] leading-9 text-ink-muted">{SUCCESS_COPY.line2}</p>

          <GoldRule className="my-8" />

          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">رقم الطلب</dt>
              <dd className="ltr mt-1 text-[15px] font-semibold text-navy tabular-nums">
                MUR-{shortId(submissionId)}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">الحالة</dt>
              <dd className="mt-1 text-[15px] font-semibold text-navy">بانتظار مراجعة الفريق</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.18em] text-ink-faint">المراجعة</dt>
              <dd className="mt-1 text-[15px] font-semibold text-navy">بشرية — لا قرار آلي</dd>
            </div>
          </dl>

          <div className="mt-9">
            <p className="eyebrow mb-4">كيف نقرأ ملفك</p>
            <ol className="grid gap-3 sm:grid-cols-5">
              {TALENT_STAGES.map((s, i) => (
                <li key={s.key} className="rounded-2xl border border-line/80 bg-ivory-100/60 p-3">
                  <span className="ltr text-[11px] font-semibold text-gold-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-1 text-[13.5px] font-semibold text-navy">{s.ar}</p>
                  <p className="mt-1 text-[12px] leading-6 text-ink-muted">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/" className="btn-primary">
              {SUCCESS_COPY.cta}
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <p className="text-[13px] text-ink-faint">
              لا تحتاج لتقديم الطلب مرة أخرى — ملفك محفوظ في شبكة مُريح.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
