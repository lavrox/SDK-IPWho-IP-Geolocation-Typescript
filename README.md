# IPWho ([ipwho.org](https://www.ipwho.org)) TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@ipwho/ipwho?style=flat-square)](https://www.npmjs.com/package/@ipwho/ipwho) [![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/lavrox/SDK-IPWho-Typescript/blob/main/LICENSE)

Official TypeScript / Node.js client for the [IPWho](https://www.ipwho.org) IP Geolocation API. One call returns the **full** payload for an IPv4 or IPv6 address: geolocation, timezone, flag, currency, connection (ASN/ISP), security (VPN/Tor/threat), and user-agent when the API includes it.

- Product: [ipwho.org](https://www.ipwho.org)
- API docs: [ipwho.org/docs](https://www.ipwho.org/docs)
- Get an API key: [ipwho.org/free-plan](https://www.ipwho.org/free-plan) (free [Lavrox](https://lavrox.com) account)
- Live API host: `https://api.ipwho.org`

## API key

Open a free [Lavrox](https://lavrox.com) account to get an API key for [IPWho](https://www.ipwho.org). Create your key at [ipwho.org/free-plan](https://www.ipwho.org/free-plan) — no credit card required.

## Installation

```bash
npm install @ipwho/ipwho
```

```bash
yarn add @ipwho/ipwho
```

Requires Node.js 18+ (native `fetch`) or a modern browser.

## Quick Start

```typescript
import { IPWhoClient } from '@ipwho/ipwho';

const client = new IPWhoClient(process.env.IPWHO_API_KEY);

const res = await client.lookup('8.8.8.8');     // GET /ip/{ip}
const me = await client.me();                   // GET /me
const bulk = await client.bulk(['8.8.8.8', '1.1.1.1']); // GET /bulk/{a,b,c}
```

Every successful JSON call returns an `IpGeoResponse`:

```
IpGeoResponse
├── success: boolean
├── message?: string | null
└── data: GeoData
    ├── ip: string
    ├── geoLocation: GeoLocation
    ├── timezone: Timezone
    ├── flag: Flag
    ├── currency: Currency
    ├── connection: Connection
    ├── security: Security
    ├── userAgent: UserAgent
    └── responseArray?: IpGeoResponse[]   // bulk only
```

## Reading the full response (8.8.8.8)

Live [IPWho](https://www.ipwho.org) values for Google DNS: country United States, ASN 15169, timezone America/Chicago, dial code +1. Nested objects may be `null` — check before use.

```typescript
const res = await client.lookup('8.8.8.8');
const data = res.data;

console.log(data.ip); // "8.8.8.8"

const geo = data.geoLocation;
console.log(geo.continent, geo.continentCode); // "North America", "NA"
console.log(geo.country, geo.countryCode);     // "United States", "US"
console.log(geo.capital, geo.region, geo.regionCode, geo.city);
console.log(geo.postalCode, geo.dialCode);     // dialCode "+1"
console.log(geo.isInEu);                       // false
console.log(geo.latitude, geo.longitude, geo.accuracyRadius); // radius e.g. 1000

const tz = data.timezone;
console.log(tz.timeZone); // "America/Chicago"
console.log(tz.abbr, tz.offset, tz.isDst, tz.utc, tz.currentTime);

console.log(data.flag.flagIcon);    // "🇺🇸"
console.log(data.flag.flagUnicode); // "U+1F1FA U+1F1F8"

console.log(data.currency.code, data.currency.symbol, data.currency.name);
console.log(data.currency.namePlural); // "US dollars"
console.log(data.currency.hexUnicode);

const conn = data.connection;
console.log(conn.asnNumber);      // 15169
console.log(conn.asnOrg);         // "Google LLC"
console.log(conn.isp, conn.org, conn.domain);
console.log(conn.connectionType); // "Corporate"

console.log(data.security.isVpn, data.security.isTor, data.security.isThreat);

if (data.userAgent) {
  console.log(data.userAgent.browser.name, data.userAgent.os.name);
  console.log(data.userAgent.device.type, data.userAgent.cpu.architecture);
}

const me = await client.me();
console.log(me.data.ip);

const bulk = await client.bulk(['8.8.8.8', '1.1.1.1']);
for (const item of bulk.data.responseArray) {
  console.log(item.data.ip, item.data.geoLocation.country);
}
```

### Example JSON (mapped fields)

```json
{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "geoLocation": {
      "continent": "North America",
      "continentCode": "NA",
      "country": "United States",
      "countryCode": "US",
      "capital": "Washington",
      "region": "California",
      "regionCode": "CA",
      "city": null,
      "postalCode": null,
      "dialCode": "+1",
      "isInEu": false,
      "latitude": 37.751,
      "longitude": -97.822,
      "accuracyRadius": 1000
    },
    "timezone": {
      "timeZone": "America/Chicago",
      "abbr": "CDT",
      "offset": -18000,
      "isDst": true,
      "utc": "UTC-05:00",
      "currentTime": "2026-08-07T12:00:00-05:00"
    },
    "flag": { "flagIcon": "🇺🇸", "flagUnicode": "U+1F1FA U+1F1F8" },
    "currency": {
      "code": "USD",
      "symbol": "$",
      "name": "US Dollar",
      "namePlural": "US dollars",
      "hexUnicode": "0024"
    },
    "connection": {
      "asnNumber": 15169,
      "asnOrg": "Google LLC",
      "isp": "Google LLC",
      "org": "Google LLC",
      "domain": "google.com",
      "connectionType": "Corporate"
    },
    "security": { "isVpn": false, "isTor": false, "isThreat": "low" },
    "userAgent": null
  }
}
```

Anycast DNS IPs may omit city. Country, ASN, timezone, flag, and currency are populated.

## Migrating from v1

| v1 | v2 |
|----|----|
| `getIp(ip)` / `getLocation(ip)` | `lookup(ip)` then `res.data.geoLocation` |
| `getMe()` / `getLocation()` | `me()` |
| `getTimezone` / `getConnection` / `getSecurity` | nested on `lookup(ip).data` |
| *(missing)* | `bulk(ips)` |

Client class is `IPWhoClient` (was `IPWho`).

## API Reference

### `new IPWhoClient(apiKey, options?)`

- **apiKey**: [IPWho](https://www.ipwho.org) key (query `apiKey`). Required.
- **options.baseUrl**: default `https://api.ipwho.org`.
- **options.timeout**: milliseconds (default `30000`).
- **Throws**: `IPWhoError` if the key is empty.

### `lookup(ip, options?): Promise<IpGeoResponse>`

`GET /ip/{ip}`. `options.format`: `json` | `xml` | `csv`. `options.fields`: string or string[].

### `me(options?): Promise<IpGeoResponse>`

`GET /me`.

### `bulk(ips): Promise<IpGeoResponse>`

`GET /bulk/{a,b,c}`. Results: `data.responseArray`.

### Errors

`InvalidIPError` (404), `RateLimitError` (429), `APIResponseError`, `IPWhoError`.

## Type Definitions

```typescript
type IpGeoResponse = {
  success: boolean;
  data: GeoData | null;
  message?: string | null;
};

type GeoData = {
  ip: string;
  geoLocation: GeoLocation | null;
  timezone: Timezone | null;
  flag: Flag | null;
  currency: Currency | null;
  connection: Connection | null;
  security: Security | null;
  userAgent: UserAgent | null;
  responseArray?: IpGeoResponse[];
};

type GeoLocation = {
  continent: string | null;
  continentCode: string | null;
  country: string | null;
  countryCode: string | null;
  capital: string | null;
  region: string | null;
  regionCode: string | null;
  city: string | null;
  postalCode: string | null;
  dialCode: string | null;
  isInEu: boolean | null;
  latitude: number | null;
  longitude: number | null;
  accuracyRadius: number | null;
};

type Timezone = {
  timeZone: string | null;
  abbr: string | null;
  offset: number | null;
  isDst: boolean | null;
  utc: string | null;
  currentTime: string | null;
};

type Flag = { flagIcon: string | null; flagUnicode: string | null };

type Currency = {
  code: string;
  symbol: string;
  name: string;
  namePlural: string;
  hexUnicode: string;
};

type Connection = {
  asnNumber: number | null;
  asnOrg: string | null;
  isp: string | null;
  org: string | null;
  domain: string | null;
  connectionType: string | null;
};

type Security = {
  isVpn: boolean;
  isTor: boolean;
  isThreat: 'low' | 'medium' | 'high';
};

type UserAgent = {
  browser: { name: string; version: string };
  engine: { name: string; version: string };
  os: { name: string; version: string };
  device: { type: string; vendor: string; model: string };
  cpu: { architecture: string };
};
```

The wire JSON mixes casings (`postal_Code`, `flag_Icon`, `isVpn`). The client normalizes to the names above.

## Troubleshooting

- **Missing API key**: [ipwho.org](https://www.ipwho.org).
- **HTTP 403**: blank User-Agent is rejected. SDK sends `ipwho-js-sdk/1.0.0`.
- **HTTP 429 / 404**: `RateLimitError` / `InvalidIPError`.
- **Null fields**: city and user-agent are often empty on infrastructure IPs.

## Testing

```bash
IPWHO_API_KEY=your_key node test_ipwho.mjs
```

The live check is `test_ipwho.mjs`.

## Changelog

### v2.0.0

- `lookup` / `me` / `bulk` matching [api.ipwho.org](https://api.ipwho.org)
- Full `IpGeoResponse` instead of v1 getters

## License

MIT License — see [LICENSE](LICENSE).

## Support

- Documentation: [ipwho.org/docs](https://www.ipwho.org/docs)
- Contact: [ipwho.org/contact](https://www.ipwho.org/contact)
- GitHub Issues: [lavrox/SDK-IPWho-Typescript](https://github.com/lavrox/SDK-IPWho-Typescript/issues)
- Website: [ipwho.org](https://www.ipwho.org)

---

[IPWho](https://www.ipwho.org) — a [Lavrox](https://lavrox.com) network API.

[Lavrox](https://lavrox.com) — Independent API infrastructure. Lower latency, lower cost.
