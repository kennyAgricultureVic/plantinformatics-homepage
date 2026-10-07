const dateFormat = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const numberFormat = new Intl.NumberFormat("en-AU");

/** "2026-08-10" -> "10 Aug 2026" */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));

/** 32656 -> "32,656" */
export const formatNumber = (n: number) => numberFormat.format(n);
