import { isAxiosError } from "axios";

export type FieldPath = Array<string | number>;

export interface ServerFieldError {
  name: FieldPath;
  errors: string[];
}

const NON_FIELD = "non_field_errors";

const toPath = (attr: string): FieldPath =>
  attr
    .split(".")
    .filter((part) => part && part !== NON_FIELD)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));

const push = (out: Map<string, ServerFieldError>, name: FieldPath, message: string) => {
  if (name.length === 0) return;
  const key = name.join(".");
  const entry = out.get(key) ?? { name, errors: [] };
  entry.errors.push(message);
  out.set(key, entry);
};

/** Walks a plain DRF error body: `{ pricing_rules: [{}, { band_max: ["..."] }] }`. */
const walk = (out: Map<string, ServerFieldError>, value: unknown, path: FieldPath) => {
  if (typeof value === "string") return push(out, path, value);
  if (Array.isArray(value)) {
    value.forEach((item, i) =>
      typeof item === "string" ? push(out, path, item) : walk(out, item, [...path, i])
    );
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) =>
      walk(out, child, key === NON_FIELD ? path : [...path, key])
    );
  }
};

/**
 * Converts a DRF 400 into antd `setFields` entries. Handles drf-standardized-errors
 * (`{ errors: [{ attr: "pricing_rules.0.band_max", detail }] }`) and plain nested DRF bodies.
 */
export function parseServerFieldErrors(error: unknown): ServerFieldError[] {
  if (!isAxiosError(error) || error.response?.status !== 400) return [];
  const data = error.response.data as unknown;
  const out = new Map<string, ServerFieldError>();

  if (data && typeof data === "object" && Array.isArray((data as { errors?: unknown }).errors)) {
    (data as { errors: Array<{ attr?: string | null; detail?: string }> }).errors.forEach((e) => {
      if (e.attr) push(out, toPath(e.attr), e.detail ?? "Invalid value");
    });
  } else {
    walk(out, data, []);
  }

  return [...out.values()];
}
