"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SUCCESS_COPY, TALENT_STAGES } from "@/lib/content";
import { Mark } from "@/components/brand/Logo";
import { ArrowLeft, CheckIcon } from "@/components/ui/Primitives";
import Link from "next/link";
import { shortId } from "@/lib/utils";

/** شاشة بعد الإرسال — ختم ذهبي على كحلي، لا رسالة «Success!» */
export function SuccessScreen({ submissionId }: { submissionId: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="apply-rail relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16 text-center">
      {/* حلقات الختم الذهبي */}
      <motion.div
        aria-hidden
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/25"
      />
      <motion.div
        aria-hidden
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/15"
      />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl"
      >
        {/* الختم */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: reduce ? 0 : -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-gold/50 bg-navy-800/80 shadow-gold-ring"
        >
          <Mark size={54} />
        </motion.div>

        <p className="rail-eyebrow mt-7">Mureeh Talent Network</p>
        <h1 className="mt-3 text-[34px] font-semibold leading-snug text-ivory-50 sm:text-[42px]">
          {SUCCESS_COPY.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-9 text-ivory-100/75">
          {SUCCESS_COPY.line1}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-8 text-ivory-100/55">
          {SUCCESS_COPY.line2}
        </p>

        {/* بطاقة الرقم والحالة */}
        <div className="mx-auto mt-9 grid max-w-xl gap-px overflow-hidden rounded-2xl border border-ivory-50/10 bg-ivory-50/10 sm:grid-cols-3">
          {[
            { k: "رقم الطلب", v: `MUR-${shortId(submissionId)}`, ltr: true },
            { k: "الحالة", v: "بانتظار مراجعة الفريق" },
            { k: "المراجعة", v: "بشرية — لا قرار آلي" },
          ].map((c) => (
            <div key={c.k} className="bg-navy-800/80 px-4 py-4">
              <p className="text-[10.5px] uppercase tracking-[0.2em] text-ivory-100/45">{c.k}</p>
              <p
                className={
                  "mt-1.5 text-[14.5px] font-semibold text-gold-soft" + (c.ltr ? " ltr tabular-nums" : "")
                }
              >
                {c.v}
              </p>
            </div>
          ))}
        </div>

        {/* كيف نقرأ ملفك */}
        <div className="mx-auto mt-9 max-w-xl">
          <p className="rail-eyebrow">كيف نقرأ ملفك</p>
          <ol className="mt-4 grid gap-2 sm:grid-cols-5">
            {TALENT_STAGES.map((s, i) => (
              <li
                key={s.key}
                className="rounded-xl border border-ivory-50/10 bg-navy-800/60 px-2.5 py-3"
              >
                <span className="ltr text-[10.5px] font-semibold text-gold-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-1 text-[12.5px] font-semibold text-ivory-50">{s.ar}</p>
                <p className="ltr mt-0.5 text-[9.5px] uppercase tracking-[0.16em] text-ivory-100/40">
                  {s.en}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-gold">
            {SUCCESS_COPY.cta}
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="flex items-center gap-2 text-[12.5px] text-ivory-100/50">
            <CheckIcon className="h-3.5 w-3.5 text-gold-soft" />
            لا تحتاج لتقديم الطلب مرة أخرى — ملفك محفوظ في شبكة مُريح.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
