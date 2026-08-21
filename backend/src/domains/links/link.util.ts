import { createHash } from "node:crypto";
import { ApiError } from "../../shared/ApiError";

export interface NormalizedUrl {
  url: string;
  hostname: string;
  domain: string;
  faviconUrl: string;
  urlHash: string;
}

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
]);

export function sanitizeUrlInput(rawUrl: string) {
  return rawUrl.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, "").trim();
}

export function hashUrl(url: string) {
  return createHash("sha256").update(url).digest("hex");
}

export function normalizeUrl(rawUrl: string): NormalizedUrl {
  const trimmed = sanitizeUrlInput(rawUrl);
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw ApiError.badRequest("올바른 URL 형식이 아닙니다.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw ApiError.badRequest("올바른 URL 형식이 아닙니다.");
  }

  if (!parsed.hostname) {
    throw ApiError.badRequest("올바른 URL 형식이 아닙니다.");
  }

  parsed.hash = "";
  parsed.hostname = parsed.hostname.toLowerCase();

  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  for (const key of [...parsed.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      parsed.searchParams.delete(key);
    }
  }

  const url = parsed.toString();
  const hostname = parsed.hostname;
  const domain = hostname.replace(/^www\./i, "");
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

  return { url, hostname, domain, faviconUrl, urlHash: hashUrl(url) };
}
