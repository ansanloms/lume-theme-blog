/**
 * Temporal.ZonedDateTime を ISO 8601 文字列にフォーマットする。
 * IANA タイムゾーンアノテーション部分（`[...]`）は表示不要のため除去する。
 */
export const formatDate = (dt: Temporal.ZonedDateTime): string =>
  dt.toString({ timeZoneName: "never" });

/**
 * Date を Temporal.ZonedDateTime に変換する。
 */
export const parseDateToZonedDateTime = (
  date: Date,
): Temporal.ZonedDateTime => {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(Temporal.Now.timeZoneId());
};
