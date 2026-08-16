import * as fs from "fs";
import * as path from "path";

import {
  CACHE_DIR,
  MIN_REQUEST_DELAY_MS,
  TIMEOUT_MS,
  USER_AGENT,
} from "./config.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureCacheDirExists = () => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
};

const getCacheFilePath = (url) => {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  const safeName =
    pathname
      .replace(/\//g, "-")
      .replace(/\.html?$/, ".html")
      .replace(/[^a-zA-Z0-9._-]/g, "-") || "index.html";

  return path.join(CACHE_DIR, safeName);
};

const fetchWithCache = async (pageUrl, lastRequestTime) => {
  const cacheFilePath = getCacheFilePath(pageUrl);

  if (fs.existsSync(cacheFilePath)) {
    return {
      html: fs.readFileSync(cacheFilePath, "utf-8"),
      fromCache: true,
    };
  }

  if (lastRequestTime !== null) {
    const elapsedTime = Date.now() - lastRequestTime;
    const waitTime = MIN_REQUEST_DELAY_MS - elapsedTime;

    if (waitTime > 0) {
      await sleep(waitTime);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch ${pageUrl}: ${response.status} ${response.statusText}`,
      );
    }

    const html = await response.text();
    fs.writeFileSync(cacheFilePath, html, "utf-8");

    return {
      html,
      fromCache: false,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export { ensureCacheDirExists, getCacheFilePath, fetchWithCache };
