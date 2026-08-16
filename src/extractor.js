import * as cheerio from "cheerio";

import { fetchWithCache } from "./cache.js";

const RATING_MAP = {
  One: "One",
  Two: "Two",
  Three: "Three",
  Four: "Four",
  Five: "Five",
};

const getRatingText = ($, productRoot) => {
  const ratingClass =
    productRoot.find(".star-rating").first().attr("class") || "";
  const ratingName = ratingClass
    .split(/\s+/)
    .find((cls) => Object.hasOwn(RATING_MAP, cls));

  return ratingName ? RATING_MAP[ratingName] : null;
};

const getDescription = ($, productRoot) => {
  const descriptionElement = productRoot
    .find("#product_description")
    .next("p")
    .first();

  const description = descriptionElement.length
    ? descriptionElement
        .text()
        .replace(/^\s+|\s+$/g, " ")
        .trim()
    : null;

  return description || null;
};

export const extractBookRecord = async ({ url, sourcePage, lastRequestTime }) => {
  const { html } = await fetchWithCache(url, lastRequestTime);
  const $ = cheerio.load(html);

  const productRoot = $("article.product_page").length
  ? $("article.product_page")
  : $(".product_page")

  const title = productRoot.find("h1").first().text().trim() || null;
  const priceText = productRoot.find(".price_color").first().text().trim() || null;
  const availabilityText = productRoot.find(".instock.availability").first().text().replace(/\s+/g, " ").trim() || null;
  const ratingText = getRatingText($, productRoot);
  const description = getDescription($, productRoot);

  return {
    title,
    product_url: url,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  }
}

export const extractDetailPages = async (bookLinks) => {
  const records = [];
  let lastRequestTime = null;

  for (const { url, sourcePage } of bookLinks) {
    const record = await extractBookRecord({ url, sourcePage, lastRequestTime });
    records.push(record);
    lastRequestTime = Date.now();
  }
  return records;
}