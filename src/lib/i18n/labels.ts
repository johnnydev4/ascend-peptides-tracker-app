type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Localized label for a dose status. */
export function statusLabel(t: TFn, status: string): string {
  return t(`status.${status}`);
}

/** Localized label for a treatment status (shares the status.* namespace). */
export function treatmentStatusLabel(t: TFn, status: string): string {
  return t(`status.${status}`);
}

/** Localized label for a side-effect severity. */
export function severityLabel(t: TFn, severity: string): string {
  return t(`severity.${severity}`);
}

/** Localized label for a body-measurement metric. */
export function metricLabel(t: TFn, metric: string): string {
  return t(`metric.${metric}`);
}

/**
 * Localized injection-site name from its body region, falling back to the
 * stored name for any custom region without a translation.
 */
export function siteName(
  t: TFn,
  site: { body_region: string; name: string }
): string {
  const key = `site.${site.body_region}`;
  const label = t(key);
  return label === key ? site.name : label;
}
