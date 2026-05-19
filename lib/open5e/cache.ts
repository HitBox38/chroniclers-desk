export const OPEN5E_REVALIDATE_SECONDS = 60 * 60;

export const OPEN5E_CACHE_HEADERS = {
  "Cache-Control": `public, max-age=300, s-maxage=${OPEN5E_REVALIDATE_SECONDS}, stale-while-revalidate=${OPEN5E_REVALIDATE_SECONDS}`,
};

const OPEN5E_RESPONSE_CACHE_TTL_MS = OPEN5E_REVALIDATE_SECONDS * 1000;
const OPEN5E_LIST_LIMIT = 100;
const DEFAULT_MAX_OPEN5E_PAGES = 40;

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

interface FetchOpen5eJsonOptions {
  fetchFn?: typeof fetch;
  now?: () => number;
  ttlMs?: number;
}

interface Open5eListResponse<T> {
  count?: number;
  next: string | null;
  results: T[];
}

interface FetchOpen5eListOptions<TSource, TResult> extends FetchOpen5eJsonOptions {
  initialUrl: URL;
  mapResult: (result: TSource) => TResult;
  maxPages?: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();

export class Open5eFetchError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "Open5eFetchError";
    this.status = status;
  }
}

export function clearOpen5eResponseCache() {
  responseCache.clear();
}

export async function fetchOpen5eJson<T>(
  input: string | URL,
  {
    fetchFn = fetch,
    now = Date.now,
    ttlMs = OPEN5E_RESPONSE_CACHE_TTL_MS,
  }: FetchOpen5eJsonOptions = {}
) {
  const url = input.toString();
  const cached = responseCache.get(url) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now()) {
    return cached.promise;
  }

  const promise = fetchOpen5eJsonWithoutCache<T>(url, fetchFn);
  responseCache.set(url, {
    expiresAt: now() + ttlMs,
    promise,
  });

  try {
    return await promise;
  } catch (error) {
    if (responseCache.get(url)?.promise === promise) {
      responseCache.delete(url);
    }

    throw error;
  }
}

export async function fetchOpen5eList<TSource, TResult>({
  initialUrl,
  mapResult,
  maxPages = DEFAULT_MAX_OPEN5E_PAGES,
  fetchFn,
  now,
  ttlMs,
}: FetchOpen5eListOptions<TSource, TResult>) {
  const firstUrl = withListLimit(initialUrl);
  const firstPage = await fetchOpen5eJson<Open5eListResponse<TSource>>(firstUrl, {
    fetchFn,
    now,
    ttlMs,
  });

  if (hasUsableCount(firstPage.count)) {
    const pages = await fetchCountedPages({
      firstPage,
      firstUrl,
      fetchFn,
      maxPages,
      now,
      ttlMs,
    });

    return pages.flatMap((page) => page.results.map(mapResult));
  }

  const pages = await fetchLinkedPages({
    firstPage,
    fetchFn,
    maxPages,
    now,
    ttlMs,
  });

  return pages.flatMap((page) => page.results.map(mapResult));
}

async function fetchOpen5eJsonWithoutCache<T>(url: string, fetchFn: typeof fetch) {
  const response = await fetchFn(url, {
    next: { revalidate: OPEN5E_REVALIDATE_SECONDS },
  } as RequestInit);

  if (!response.ok) {
    throw new Open5eFetchError(response.status, `Open5e request failed: ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchCountedPages<T>({
  firstPage,
  firstUrl,
  fetchFn,
  maxPages,
  now,
  ttlMs,
}: {
  firstPage: Open5eListResponse<T>;
  firstUrl: URL;
  fetchFn?: typeof fetch;
  maxPages: number;
  now?: () => number;
  ttlMs?: number;
}) {
  const limit = getListLimit(firstUrl);
  const pageCount = Math.min(Math.ceil((firstPage.count ?? 0) / limit), maxPages);
  const pagePromises = [];

  for (let pageIndex = 1; pageIndex < pageCount; pageIndex += 1) {
    const pageUrl = new URL(firstUrl);
    pageUrl.searchParams.set("offset", String(pageIndex * limit));
    pagePromises.push(
      fetchOpen5eJson<Open5eListResponse<T>>(pageUrl, {
        fetchFn,
        now,
        ttlMs,
      })
    );
  }

  return [firstPage, ...(await Promise.all(pagePromises))];
}

async function fetchLinkedPages<T>({
  firstPage,
  fetchFn,
  maxPages,
  now,
  ttlMs,
}: {
  firstPage: Open5eListResponse<T>;
  fetchFn?: typeof fetch;
  maxPages: number;
  now?: () => number;
  ttlMs?: number;
}) {
  const pages = [firstPage];
  let nextUrl = firstPage.next;

  while (nextUrl && pages.length < maxPages) {
    const page = await fetchOpen5eJson<Open5eListResponse<T>>(nextUrl, {
      fetchFn,
      now,
      ttlMs,
    });
    pages.push(page);
    nextUrl = page.next;
  }

  return pages;
}

function withListLimit(url: URL) {
  const nextUrl = new URL(url);

  if (!nextUrl.searchParams.has("limit")) {
    nextUrl.searchParams.set("limit", String(OPEN5E_LIST_LIMIT));
  }

  return nextUrl;
}

function getListLimit(url: URL) {
  const limit = Number(url.searchParams.get("limit") ?? OPEN5E_LIST_LIMIT);
  return Number.isFinite(limit) && limit > 0 ? limit : OPEN5E_LIST_LIMIT;
}

function hasUsableCount(count: number | undefined): count is number {
  return typeof count === "number" && Number.isFinite(count) && count > 0;
}
