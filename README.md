# Books to Scrape Pipeline

## Target Classification

- Site: `https://books.toscrape.com/`
- Scope: the first 3 catalogue pages only.
- Data collected: book title, price, availability, rating, description, canonical product URL, source page, and fetch timestamp.
- Why this is appropriate: the site is a public practice catalog built for scraping exercises, and the project only collects public catalog metadata.

## Run

One copy-pasteable command:

```bash
npm run dev
```

## Lane and Install

- Lane: Node.js with npm.
- Install: run `npm install`.

## Record Schema

Each finished record must match this shape:

- `title`: string
- `product_url`: absolute URL string and canonical identity
- `price_text`: string
- `price_gbp`: number
- `availability_text`: string
- `rating_text`: string or null
- `description`: string or null
- `source_page`: absolute URL string
- `fetched_at`: ISO 8601 timestamp string

## Politeness Rules

- User-agent: send `FlyRankInternship-A9/1.0 (+https://github.com/seifmthabet/scraper-pipeline)`.
- Delay: wait at least 500 ms between real requests.
- Timeout: abort slow requests after 5000 ms.
- Cache: reuse saved HTML from `cache/` and do not delay cached reads.

## Honest Limitation

The scraper can follow the catalogue pagination across the site, but this run intentionally stops after 3 pages because the fetch loop is capped there.

## Why No Browser

The data is already in the HTML the server sends, so a browser would only add cost without improving access to the records.

## Ethics Note

Use an official API when one exists; never bypass logins, paywalls, or blocks; collect only what you need.

## Proof Run

Real `output/run-report.json` from a completed run:

```json
{
	"start_time": "2026-08-16T19:47:50.080Z",
	"duration_ms": 405,
	"pages_fetched": 60,
	"cache_hits": 60,
	"valid_records": 60,
	"invalid_records": 0,
	"failed_pages": 0
}
```
