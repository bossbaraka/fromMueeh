"use client";

/**
 * حقول النموذج — مبنية على عناصر HTML أصلية:
 *  • كل حقل له label حقيقي، وaria-describedby، وaria-invalid.
 *  • الخيارات (Radio / Checkbox) عناصر input حقيقية مخفية بصريًا (peer) — تعمل بالكيبورد وقارئ الشاشة.
 *  • لا تنسيق يعتمد على اللون وحده: الحدود + أيقونة + نص الخطأ.
 */

import * as React from "react";
import { Controller, type FieldError, type UseFormReturn } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import type { FieldName, FormValues } from "@/lib/schema";
import { cn, charCount } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/Primitives";

export type Form = UseFormReturn<FormValues>;

/* ------------------------------- Shell ------------------------------- */

export function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
  labelAs = "label",
  index,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: FieldError | { message?: string };
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelAs?: "label" | "div";
  index?: string;
}) {
  const Label = labelAs;
  return (
    <div className={cn("group/field", className)}>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Label
          htmlFor={labelAs === "label" ? id : undefined}
          className="text-[15px] font-semibold text-navy"
        >
          {index && <span className="ltr me-2 text-2xs font-medium text-gold-deep">{index}</span>}
          {label}
          {required ? (
            <span className="ms-1 text-gold-deep" aria-hidden>
              *
            </span>
          ) : (
            <span className="ms-2 text-[12px] font-normal text-ink-faint">(اختياري)</span>
          )}
        </Label>
        {hint && <span className="text-[13px] leading-6 text-ink-faint">{hint}</span>}
      </div>
      {children}
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

export function ErrorText({
  id,
  error,
}: {
  id: string;
  error?: FieldError | { message?: string };
}) {
  const message = error?.message;
  return (
    <div aria-live="polite" className="min-h-[24px]">
      <AnimatePresence initial={false}>
        {message && (
          <motion.p
            key={message}
            id={id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 flex items-start gap-2 text-[13.5px] font-medium leading-6 text-red-700"
          >
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Text -------------------------------- */

export function TextInput({
  form,
  name,
  label,
  hint,
  placeholder,
  autoComplete,
  type = "text",
  dir,
  inputMode,
  required = true,
  maxLength = 160,
  className,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  dir?: "rtl" | "ltr";
  inputMode?: "text" | "email" | "tel" | "url" | "numeric";
  required?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        type={type}
        dir={dir}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${id}-hint ${id}-error` : `${id}-error`}
        className="field-input"
        {...form.register(name)}
      />
    </FieldShell>
  );
}

export function TextArea({
  form,
  name,
  label,
  hint,
  placeholder,
  minLength,
  maxLength = 4000,
  rows = 6,
  index,
  required = true,
  className,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  index?: string;
  required?: boolean;
  className?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const value = String(form.watch(name) ?? "");
  const count = charCount(value);
  const id = `f-${name}`;
  const reached = minLength ? count >= minLength : true;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} index={index} className={className}>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-counter ${id}-error`}
        placeholder={placeholder}
        className="field-textarea"
        {...form.register(name)}
      />
      <div id={`${id}-counter`} className="mt-2 space-y-1.5">
        {minLength ? (
          <div
            aria-hidden
            className="count-line"
            title={`${count}/${minLength} حرفًا كحدّ أدنى`}
          >
            <span style={{ width: `${Math.min(100, Math.round((count / minLength) * 100))}%` }} />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 text-[12px] text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            {minLength ? (
              <>
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    reached ? "bg-emerald-500" : "bg-gold/70",
                  )}
                />
                {reached ? "شكرًا — واضح." : `اكتب على الأقل ${minLength} حرفًا`}
              </>
            ) : (
              <span aria-hidden />
            )}
          </span>
          <span className="ltr tabular-nums">
            {count}/{maxLength}
          </span>
        </div>
      </div>
    </FieldShell>
  );
}

export function SelectInput({
  form,
  name,
  label,
  hint,
  options,
  required = true,
  className,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  options: readonly string[];
  required?: boolean;
  className?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
        className="field-input appearance-none bg-[length:14px] bg-[left_1rem_center] bg-no-repeat ps-4 pe-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235F5A50' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...form.register(name)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/* --------------------------- Radio (cards) --------------------------- */

export function RadioCards({
  form,
  name,
  label,
  hint,
  options,
  columns = 2,
  required = true,
  index,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  options: readonly { value: string; ar?: string; desc?: string }[];
  columns?: 1 | 2 | 3;
  required?: boolean;
  index?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;
  const colClass =
    columns === 1 ? "grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAs="div"
      index={index}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div role="radiogroup" aria-labelledby={`${id}-legend`} className={cn("grid grid-cols-1 gap-3", colClass)}>
            <span id={`${id}-legend`} className="sr-only">
              {label}
            </span>
            {options.map((o) => {
              const checked = field.value === o.value;
              return (
                <label key={o.value} className="relative block">
                  <input
                    type="radio"
                    name={field.name}
                    value={o.value}
                    checked={checked}
                    onChange={() => field.onChange(o.value)}
                    onBlur={field.onBlur}
                    className="peer sr-only"
                  />
                  <span className="option-card items-start">
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                        checked ? "border-gold-deep bg-gold text-navy" : "border-ivory-500 bg-white",
                      )}
                    >
                      {checked && <CheckIcon className="h-3 w-3" />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[14.5px] font-semibold text-navy">
                        {o.ar ?? o.value}
                        {o.ar && (
                          <span className="ltr ms-2 text-[12px] font-normal text-ink-faint">
                            {o.value}
                          </span>
                        )}
                      </span>
                      {o.desc && (
                        <span className="text-[13px] leading-6 text-ink-muted">{o.desc}</span>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      />
    </FieldShell>
  );
}

/* --------------------- Segmented pills (سريع ومكثّف) ------------------ */

export function Segmented({
  form,
  name,
  label,
  hint,
  options,
  required = true,
  index,
  className,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  options: readonly { value: string; ar?: string }[];
  required?: boolean;
  index?: string;
  className?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAs="div"
      index={index}
      className={className}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-labelledby={`${id}-legend`}
            className="flex flex-wrap gap-2"
          >
            <span id={`${id}-legend`} className="sr-only">
              {label}
            </span>
            {options.map((o) => {
              const checked = field.value === o.value;
              return (
                <label key={o.value} className="relative inline-flex">
                  <input
                    type="radio"
                    name={field.name}
                    value={o.value}
                    checked={checked}
                    onChange={() => field.onChange(o.value)}
                    onBlur={field.onBlur}
                    className="peer sr-only"
                  />
                  <span className="seg">
                    {checked && <CheckIcon className="h-3.5 w-3.5 text-gold" />}
                    <span>{o.ar ?? o.value}</span>
                    {o.ar && o.ar !== o.value && (
                      <span className="ltr text-[11px] opacity-60">{o.value}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      />
    </FieldShell>
  );
}

/* ------------------- Radio with description (بطاقات وصفيّة) ------------------- */

export function RadioDesc({
  form,
  name,
  label,
  hint,
  options,
  columns = 2,
  required = true,
  index,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  options: readonly { value: string; ar?: string; desc?: string }[];
  columns?: 1 | 2 | 3;
  required?: boolean;
  index?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;
  const colClass =
    columns === 1 ? "grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAs="div"
      index={index}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-labelledby={`${id}-legend`}
            className={cn("grid grid-cols-1 gap-2.5", colClass)}
          >
            <span id={`${id}-legend`} className="sr-only">
              {label}
            </span>
            {options.map((o) => {
              const checked = field.value === o.value;
              return (
                <label key={o.value} className="relative block">
                  <input
                    type="radio"
                    name={field.name}
                    value={o.value}
                    checked={checked}
                    onChange={() => field.onChange(o.value)}
                    onBlur={field.onBlur}
                    className="peer sr-only"
                  />
                  <span className="seg-desc">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-navy">{o.ar ?? o.value}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
                          checked ? "border-gold-deep bg-gold text-navy" : "border-ivory-500 bg-white",
                        )}
                      >
                        {checked && <CheckIcon className="h-2.5 w-2.5" />}
                      </span>
                    </span>
                    {o.desc && (
                      <span className="text-[12.5px] leading-6 text-ink-muted">{o.desc}</span>
                    )}
                    {o.ar && o.ar !== o.value && (
                      <span className="ltr text-[11px] text-ink-faint">{o.value}</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      />
    </FieldShell>
  );
}

/* ------------------------- Multi select (chips) ---------------------- */

export function ChipMulti({
  form,
  name,
  label,
  hint,
  options,
  groups,
  required = true,
  index,
}: {
  form: Form;
  name: FieldName;
  label: string;
  hint?: string;
  options?: readonly string[];
  groups?: readonly { key: string; label: string; blurb?: string; items: readonly string[] }[];
  required?: boolean;
  index?: string;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      labelAs="div"
      index={index}
    >
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => {
          const selected: string[] = Array.isArray(field.value) ? field.value : [];
          const toggle = (item: string) => {
            field.onChange(
              selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item],
            );
          };

          const renderChips = (items: readonly string[]) => (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const checked = selected.includes(item);
                return (
                  <label key={item} className="relative inline-flex">
                    <input
                      type="checkbox"
                      value={item}
                      checked={checked}
                      onChange={() => toggle(item)}
                      onBlur={field.onBlur}
                      className="peer sr-only"
                    />
                    <span className="chip">
                      <span
                        aria-hidden
                        className={cn(
                          "grid h-3.5 w-3.5 place-items-center rounded-[5px] border transition-colors",
                          checked ? "border-gold-deep bg-gold-deep text-white" : "border-ivory-500",
                        )}
                      >
                        {checked && <CheckIcon className="h-2.5 w-2.5" />}
                      </span>
                      <span className="ltr">{item}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          );

          return (
            <div className="space-y-5">
              {groups
                ? groups.map((g) => (
                    <fieldset key={g.key} className="rounded-2xl border border-line/80 bg-ivory-100/60 p-4">
                      <legend className="px-2 text-[13px] font-semibold text-navy">{g.label}</legend>
                      {g.blurb && <p className="mb-3 text-[12.5px] text-ink-faint">{g.blurb}</p>}
                      {renderChips(g.items)}
                    </fieldset>
                  ))
                : renderChips(options ?? [])}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}

/* --------------------------- Single checkbox ------------------------- */

export function CheckboxRow({
  form,
  name,
  label,
  description,
  required = true,
}: {
  form: Form;
  name: FieldName;
  label: string;
  description?: string;
  required?: boolean;
}) {
  const error = form.formState.errors[name] as FieldError | undefined;
  const id = `f-${name}`;
  const checked = Boolean(form.watch(name));

  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ease-calm",
          checked ? "border-gold-deep/70 bg-gold-tint/60" : "border-line bg-ivory-50 hover:border-gold/40",
        )}
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
          {...form.register(name)}
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-gold/25",
            checked ? "border-gold-deep bg-gold-deep text-white" : "border-ivory-500 bg-white",
          )}
        >
          {checked && <CheckIcon className="h-3 w-3" />}
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-[14.5px] font-medium leading-7 text-ink">{label}</span>
          {description && <span className="text-[13px] text-ink-muted">{description}</span>}
        </span>
      </label>
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}
