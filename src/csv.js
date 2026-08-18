const CSV_COLUMNS = [
  "title",
  "product_url",
  "price_text",
  "price_gbp",
  "availability_text",
  "rating_text",
  "description",
  "source_page",
  "fetched_at",
];

const escapeCsvValue = (value) => {
  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const convertToCsvCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return escapeCsvValue(value);
};

export const buildCsvBooks = (records) => {
  const rows = [];
  rows.push(CSV_COLUMNS.join(","));

  let ratingNullCount = 0;
  let descriptionNullCount = 0;
  let objectFallbackCount = 0;

  for (const record of records) {
    if (record.rating_text === null) ratingNullCount += 1;
    if (record.description === null) descriptionNullCount += 1;

    const row = CSV_COLUMNS.map((column) => {
      const value = record[column];
      if (typeof value === "object" && value !== null) {
        objectFallbackCount += 1;
      }
      return convertToCsvCell(value);
    }).join(",");

    rows.push(row);
  }

  const flatteningNotes = {
    output: "books.csv",
    notes: [
      {
        field: "rating_text",
        rule: "null is flattened to an empty CSV cell",
        count: ratingNullCount,
      },
      {
        field: "description",
        rule: "null is flattened to an empty CSV cell",
        count: descriptionNullCount,
      },
      {
        field: "all_fields",
        rule: "all validated fields are scalar in schema; no nested flattening required",
        count: 0,
      },
    ],
    object_fallback_count: objectFallbackCount,
  };

  return {
    csvText: rows.join("\n"),
    flatteningNotes,
  };
};
