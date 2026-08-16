import { crawlCatalogue } from "./crawler.js";

const main = async () => {
  const result = await crawlCatalogue();

  console.log(`catalogue_pages=${result.cataloguePages}`);
  console.log(`discovered=${result.discovered}`);
  console.log(`unique_urls=${result.uniqueUrls}`);
};

main().catch((error) => {
  console.error("Error during crawling:", error);
  process.exitCode = 1;
});
