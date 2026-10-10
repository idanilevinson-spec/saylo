// The Supabase API returns at most 1000 rows per request, whatever
// .limit() asks for, and it does so silently. Anything that reads "all of
// a learner's attempts" or "all published exercises" would quietly work on
// a truncated list once it passes that size. This pages through the result
// instead.
//
// `page` must build a fresh query for each range and give it a stable
// order (e.g. .order("id")), or rows can repeat or go missing between
// pages. Returns the same { data, error } shape as a single query, so it
// drops into existing destructuring.
export const PAGE_SIZE = 1000;

export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  maxRows = 50_000,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { data: rows, error: null };
}
