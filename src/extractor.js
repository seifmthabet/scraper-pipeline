import * as cheerio from "cheerio";

import { fetchWithCache } from "./cache.js";
import { BookRecordSchema } from "./schema.js";

const RATING_MAP = {
  One: "One",
  Two: "Two",
  Three: "Three",
  Four: "Four",
  Five: "Five",
};

const parsePriceGbp = (priceText) => {
  if (!priceText) return null;
  const rawPrice = priceText.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(rawPrice);
  return Number.isFinite(value) ? value : null;
}

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

export const normalizeBookRecord = (record) => {
  const priceGbp = parsePriceGbp(record.price_text);

  const normalizedRecord = {
    ...record,
    price_gbp: priceGbp,
  }

  const parsedRecord = BookRecordSchema.safeParse(normalizedRecord);

  if (!parsedRecord.success) {
    return {
      ok: false,
      error: parsedRecord.error.issues,
      record: normalizedRecord,
    }
  }

  return {
    ok: true,
    record: parsedRecord.data,
  }
}

export const extractValidatedRecords = async (bookLinks) => {
  const goodRecords = [];
  const badRecords = [];
  let lastRequestTime = null;

  for (const { url, sourcePage } of bookLinks) {
    try {
      const record = await extractBookRecord({
        url,
        sourcePage,
        lastRequestTime,
      });

      const validation = normalizeBookRecord(record);

      if (!validation.ok) {
        badRecords.push({
          product_url: url,
          source_page: sourcePage,
          reason: validation.error
        })
        continue;
      }

      goodRecords.push(validation.record);
      lastRequestTime = Date.now();

    } catch (error) {
      badRecords.push({
        product_url: url,
        source_page: sourcePage,
        reason: error.message,
      })
    }
  }

  return {
    goodRecords,
    badRecords,
  }
}