import { mkdir, writeFile } from "node:fs/promises";

const CACHE_DIR = "cache";
const CACHE_FILE = `${CACHE_DIR}/catalogue-page-1.html`;
const CATALOGUE_URL = "https://books.toscrape.com/catalogue/category/books/travel_2";
const USER_AGENT =
  "FlyRankInternship-A9/1.0 (+https://github.com/seifmthabet/scraper-pipeline)";
const TIMEOUT_MS = 5000;

const fetchData = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(CATALOGUE_URL, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (response.status !== 200) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    const html = await response.text();

    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, html, "utf8");
    console.log(`Saved ${CACHE_FILE}`);
  } catch (error) {
    console.error("Fetching data error:", error);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeoutId);
  }
};

fetchData();
