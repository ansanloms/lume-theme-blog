import { assertEquals } from "jsr:@std/assert@1";
import { formatDate } from "./date.ts";

// --- formatDate ---

Deno.test("formatDate: タイムゾーンアノテーションが除去される", () => {
  const dt = Temporal.ZonedDateTime.from(
    "2024-06-15T09:30:00+09:00[Asia/Tokyo]",
  );
  const result = formatDate(dt);
  assertEquals(result.includes("["), false);
  assertEquals(result.includes("]"), false);
});

Deno.test("formatDate: ISO 8601 形式の文字列を返す", () => {
  const dt = Temporal.ZonedDateTime.from(
    "2024-06-15T09:30:00+09:00[Asia/Tokyo]",
  );
  const result = formatDate(dt);
  assertEquals(result, "2024-06-15T09:30:00+09:00");
});

Deno.test("formatDate: UTC のタイムゾーンでも正しくフォーマットされる", () => {
  const dt = Temporal.ZonedDateTime.from("2025-01-01T00:00:00+00:00[UTC]");
  const result = formatDate(dt);
  assertEquals(result, "2025-01-01T00:00:00+00:00");
});

Deno.test("formatDate: 負のオフセットでも正しくフォーマットされる", () => {
  const dt = Temporal.ZonedDateTime.from(
    "2024-12-31T20:00:00-05:00[America/New_York]",
  );
  const result = formatDate(dt);
  assertEquals(result, "2024-12-31T20:00:00-05:00");
});
