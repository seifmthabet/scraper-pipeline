import * as fs from "fs";
import * as path from "path";

import { crawlCatalogue } from "./crawler.js";
import { extractValidatedRecords } from "./extractor.js";
import { OUTPUT_DIR } from "./config.js";

const ensureOutputDirExists = () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const main = async () => {
  ensureOutputDirExists();

  const startedAt = new Date();
  const startedMs = Date.now();

  const result = await crawlCatalogue();

  const bookLinks = [...result.bookLinks];

  const { goodRecords, badRecords, pagesFetched, cacheHits } =
    await extractValidatedRecords(bookLinks);

  const sortedBooks = [...goodRecords].sort((a, b) =>
    a.product_url.localeCompare(b.product_url),
  );
  const sortedErrors = [...badRecords].sort((a, b) =>
    a.product_url.localeCompare(b.product_url),
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "books.json"),
    JSON.stringify(sortedBooks, null, 2),
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "errors.json"),
    JSON.stringify(sortedErrors, null, 2),
  );

  const runReport = {
    start_time: startedAt.toISOString(),
    duration_ms: Date.now() - startedMs,
    pages_fetched: pagesFetched,
    cache_hits: cacheHits,
    valid_records: sortedBooks.length,
    invalid_records: sortedErrors.length,
    failed_pages: sortedErrors.length,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "run-report.json"),
    JSON.stringify(runReport, null, 2),
  );

  if (sortedBooks.length > 0) {
    console.log(JSON.stringify(sortedBooks[0], null, 2));
  }

  console.log(`detail_pages=${sortedBooks.length}`);
};

main().catch((error) => {
  console.error("Error during crawling:", error);
  process.exitCode = 1;
});
