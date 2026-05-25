/**
 * Temporal.ZonedDateTime を ISO 8601 文字列にフォーマットする。
 * IANA タイムゾーンアノテーション部分（`[...]`）は表示不要のため除去する。
 */
export const formatDate = (dt: Temporal.ZonedDateTime): string =>
  dt.toString({ timeZoneName: "never" });
