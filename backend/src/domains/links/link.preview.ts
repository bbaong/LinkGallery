import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 2500;
const MAX_HTML_BYTES = 400_000;

function isPrivateIPv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIp(ip: string) {
  const mapped = ip.replace(/^::ffff:/i, "");
  if (isIP(mapped) === 4) return isPrivateIPv4(mapped);
  const normalized = ip.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  );
}

async function assertPublicHttpUrl(raw: string) {
  const parsed = new URL(raw);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("private host");
  }
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("private ip");
    return parsed;
  }
  const records = await lookup(hostname, { all: true });
  if (records.length === 0 || records.some((record) => isPrivateIp(record.address))) {
    throw new Error("private dns");
  }
  return parsed;
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function metaContent(html: string, key: string) {
  const pattern = new RegExp(
    `<meta\\s+[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>|<meta\\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["'][^>]*>`,
    "i"
  );
  const match = html.match(pattern);
  const value = match?.[1] ?? match?.[2];
  return value ? decodeEntities(value.trim()) : null;
}

function pickPreviewUrl(html: string, pageUrl: string) {
  const candidates = [
    metaContent(html, "og:image"),
    metaContent(html, "og:image:secure_url"),
    metaContent(html, "twitter:image"),
    metaContent(html, "twitter:image:src"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const resolved = new URL(candidate, pageUrl);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        return resolved.toString().slice(0, 1024);
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function readLimitedText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    return text.slice(0, MAX_HTML_BYTES);
  }
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (received < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    const remaining = MAX_HTML_BYTES - received;
    chunks.push(value.byteLength > remaining ? value.subarray(0, remaining) : value);
    received += Math.min(value.byteLength, remaining);
  }
  await reader.cancel().catch(() => undefined);
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8").decode(merged);
}

export async function fetchLinkPreviewImage(pageUrl: string): Promise<string | null> {
  try {
    await assertPublicHttpUrl(pageUrl);
    const response = await fetch(pageUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) return null;
    await assertPublicHttpUrl(response.url);
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      return null;
    }
    const html = await readLimitedText(response);
    return pickPreviewUrl(html, response.url);
  } catch {
    return null;
  }
}
