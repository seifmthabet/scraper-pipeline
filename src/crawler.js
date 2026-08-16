import * as cheerio from "cheerio";

import { CATALOGUE_URL } from "./config.js";
import { fetchWithCache, ensureCacheDirExists } from "./cache.js";

export const crawlCatalogue = async () => {
  ensureCacheDirExists();

  const discoveredUrls = new Set();
  const visitedPages = new Set();

  let currentPageUrl = CATALOGUE_URL;
  let cataloguePagesCount = 0;
  let lastRequestTime = null;

  while (currentPageUrl && cataloguePagesCount < 3) {
    if (visitedPages.has(currentPageUrl)) break;
    visitedPages.add(currentPageUrl);

    const { html } = await fetchWithCache(currentPageUrl, lastRequestTime);
    lastRequestTime = Date.now();

    const $ = cheerio.load(html);

    $(".product_pod h3 a").each((_, element) => {
      const href = $(element).attr("href");
      if (!href) return;

      const absoluteUrl = new URL(href, currentPageUrl).href;
      discoveredUrls.add(absoluteUrl);
    });

    cataloguePagesCount += 1;

    const nextPageHref = $("li.next a").first().attr("href");
    if (!nextPageHref || cataloguePagesCount >= 3) {
      break;
    }

    currentPageUrl = new URL(nextPageHref, currentPageUrl).href;
  }

  return {
    cataloguePages: cataloguePagesCount,
    discovered: discoveredUrls.size,
    uniqueUrls: discoveredUrls.size,
    bookLinks: [...discoveredUrls.entries()].map(([url, sourcePage]) => ({
      url,
      sourcePage,
    })),
  };
};
