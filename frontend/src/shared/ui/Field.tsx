import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  success?: string;
  optional?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, success, optional, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-soft">선택</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : success ? (
        <p className="text-sm text-emerald-600">{success}</p>
      ) : hint ? (
        <p className="text-sm text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}
