"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
}

/**
 * Controlled numeric input that keeps a local text buffer so intermediate edits
 * (empty string, leading minus, "1.") never clobber the parent state.
 * Commits a parsed number whenever the buffer parses to a finite value.
 */
export function NumberField({ value, onChange, className, ariaLabel, placeholder }: Props) {
  const [text, setText] = useState(() => format(value));

  // Re-sync from outside when value changes (e.g., user loads an example)
  useEffect(() => {
    setText((prev) => (parseFloat(prev) === value ? prev : format(value)));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        const n = parseFloat(v);
        if (Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        const n = parseFloat(text);
        setText(format(Number.isFinite(n) ? n : value));
      }}
      onFocus={(e) => e.currentTarget.select()}
      aria-label={ariaLabel}
      className={className}
    />
  );
}

function format(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(n);
}
