import { crawlCatalogue } from "./crawler.js";

import { extractDetailPages } from "./extractor.js";

const main = async () => {
  const result = await crawlCatalogue();

  const records = await extractDetailPages(result.bookLinks);

  if (records.length > 0) {
    console.log(JSON.stringify(records[0], null, 2))
  }
  
  console.log(`detail_pages=${records.length}`)
};

main().catch((error) => {
  console.error("Error during crawling:", error);
  process.exitCode = 1;
});
