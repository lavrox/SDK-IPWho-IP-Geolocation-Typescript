/**
 * IPWho API SDK v1.0.0 — JavaScript/TypeScript
 * ==============================================
 *
 * Enterprise-grade IP Geolocation API client.
 * ESM with JSDoc types. For Node.js 18+. The API sends no CORS headers, so it
 * can't be called from a web page on another site.
 *
 * Endpoints:
 *   - lookup(ip)   — geolocation for a specific IPv4/IPv6 address
 *   - me()         — geolocation for the caller's IP
 *   - bulk(ips)    — batch lookup for multiple IPs
 *
 * @module ipwho-sdk
 */

// ── Type definitions (JSDoc) ─────────────────────────────────────────

/**
 * @typedef {Object} GeoLocation
 * @property {string|null}  continent
 * @property {string|null}  continentCode
 * @property {string|null}  country
 * @property {string|null}  countryCode
 * @property {string|null}  capital
 * @property {string|null}  region
 * @property {string|null}  regionCode
 * @property {string|null}  city
 * @property {string|null}  postalCode
 * @property {string|null}  dialCode
 * @property {boolean|null} isInEu
 * @property {number|null}  latitude
 * @property {number|null}  longitude
 * @property {number|null}  accuracyRadius
 */

/**
 * @typedef {Object} Timezone
 * @property {string|null}  timeZone
 * @property {string|null}  abbr
 * @property {number|null}  offset
 * @property {boolean|null} isDst
 * @property {string|null}  utc
 * @property {string|null}  currentTime
 */

/**
 * @typedef {Object} Flag
 * @property {string|null} flagIcon
 * @property {string|null} flagUnicode
 */

/**
 * @typedef {Object} Currency
 * @property {string} code
 * @property {string} symbol
 * @property {string} name
 * @property {string} namePlural
 * @property {string} hexUnicode
 */

/**
 * @typedef {Object} Connection
 * @property {number|null} asnNumber
 * @property {string|null} asnOrg
 * @property {string|null} isp
 * @property {string|null} org
 * @property {string|null} domain
 * @property {string|null} connectionType
 */

/**
 * @typedef {Object} Security
 * @property {boolean}      isVpn
 * @property {boolean}      isTor
 * @property {'low'|'medium'|'high'} isThreat
 */

/**
 * @typedef {Object} UserAgentBrowser
 * @property {string} name
 * @property {string} version
 */

/**
 * @typedef {Object} UserAgentEngine
 * @property {string} name
 * @property {string} version
 */

/**
 * @typedef {Object} UserAgentOS
 * @property {string} name
 * @property {string} version
 */

/**
 * @typedef {Object} UserAgentDevice
 * @property {string} type
 * @property {string} vendor
 * @property {string} model
 */

/**
 * @typedef {Object} UserAgentCPU
 * @property {string} architecture
 */

/**
 * @typedef {Object} UserAgent
 * @property {UserAgentBrowser} browser
 * @property {UserAgentEngine}  engine
 * @property {UserAgentOS}      os
 * @property {UserAgentDevice}  device
 * @property {UserAgentCPU}     cpu
 */

/**
 * @typedef {Object} GeoData
 * @property {string}              ip
 * @property {GeoLocation|null}    geoLocation
 * @property {Timezone|null}       timezone
 * @property {Flag|null}           flag
 * @property {Currency|null}       currency
 * @property {Connection|null}     connection
 * @property {Security|null}       security
 * @property {UserAgent|null}      userAgent
 */

/**
 * @typedef {Object} IpGeoResponse
 * @property {boolean}       success
 * @property {GeoData|null}  data
 * @property {string|null}   [message]
 */

/**
 * @typedef {Object} BulkResponse
 * @property {boolean} success
 * @property {{ responseArray: IpGeoResponse[] }} data
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {false}  success
 * @property {string} message
 */

/**
 * @typedef {'json'|'xml'|'csv'} Format
 */

// ── Exceptions ───────────────────────────────────────────────────────

export class IPWhoError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'IPWhoError';
  }
}

export class InvalidIPError extends IPWhoError {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'InvalidIPError';
  }
}

export class RateLimitError extends IPWhoError {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class APIResponseError extends IPWhoError {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'APIResponseError';
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Map raw JSON data into a GeoLocation object.
 * @param {object|null} d
 * @returns {GeoLocation|null}
 */
function toGeoLocation(d) {
  if (!d) return null;
  return {
    continent:      d.continent ?? null,
    continentCode: d.continentCode ?? null,
    country:        d.country ?? null,
    countryCode:   d.countryCode ?? null,
    capital:        d.capital ?? null,
    region:         d.region ?? null,
    regionCode:    d.regionCode ?? null,
    city:           d.city ?? null,
    postalCode:     d.postal_Code ?? null,
    dialCode:       d.dial_code ?? null,
    isInEu:         d.is_in_eu ?? null,
    latitude:       d.latitude ?? null,
    longitude:      d.longitude ?? null,
    accuracyRadius: d.accuracy_radius ?? null,
  };
}

/**
 * Map raw JSON data into a Timezone object.
 * @param {object|null} d
 * @returns {Timezone|null}
 */
function toTimezone(d) {
  if (!d) return null;
  return {
    timeZone:    d.time_zone ?? null,
    abbr:        d.abbr ?? null,
    offset:      d.offset ?? null,
    isDst:       d.is_dst ?? null,
    utc:         d.utc ?? null,
    currentTime: d.current_time ?? null,
  };
}

/**
 * Map raw JSON data into a Flag object.
 * @param {object|null} d
 * @returns {Flag|null}
 */
function toFlag(d) {
  if (!d) return null;
  return {
    flagIcon:    d.flag_Icon ?? null,
    flagUnicode: d.flag_unicode ?? null,
  };
}

/**
 * Map raw JSON data into a Currency object.
 * @param {object|null} d
 * @returns {Currency|null}
 */
function toCurrency(d) {
  if (!d) return null;
  return {
    code:       d.code ?? '',
    symbol:     d.symbol ?? '',
    name:       d.name ?? '',
    namePlural: d.name_plural ?? '',
    hexUnicode: d.hex_unicode ?? '',
  };
}

/**
 * Map raw JSON data into a Connection object.
 * @param {object|null} d
 * @returns {Connection|null}
 */
function toConnection(d) {
  if (!d) return null;
  return {
    asnNumber:      d.asn_number ?? null,
    asnOrg:         d.asn_org ?? null,
    isp:            d.isp ?? null,
    org:            d.org ?? null,
    domain:         d.domain ?? null,
    connectionType: d.connection_type ?? null,
  };
}

/**
 * Map raw JSON data into a Security object.
 * @param {object|null} d
 * @returns {Security|null}
 */
function toSecurity(d) {
  if (!d) return null;
  return {
    isVpn:    d.isVpn ?? false,
    isTor:    d.isTor ?? false,
    isThreat: d.isThreat ?? 'low',
  };
}

/**
 * Map raw JSON data into a UserAgent object.
 * @param {object|null} d
 * @returns {UserAgent|null}
 */
function toUserAgent(d) {
  if (!d) return null;
  return {
    browser: d.browser ?? { name: '', version: '' },
    engine:  d.engine ?? { name: '', version: '' },
    os:      d.os ?? { name: '', version: '' },
    device:  d.device ?? { type: '', vendor: '', model: '' },
    cpu:     d.cpu ?? { architecture: '' },
  };
}

/**
 * Map raw JSON data into a GeoData object.
 * @param {object} d
 * @returns {GeoData}
 */
function toGeoData(d) {
  return {
    ip:          d.ip ?? '',
    geoLocation: toGeoLocation(d.geoLocation),
    timezone:    toTimezone(d.timezone),
    flag:        toFlag(d.flag),
    currency:    toCurrency(d.currency),
    connection:  toConnection(d.connection),
    security:    toSecurity(d.security),
    userAgent:   toUserAgent(d.userAgent),
  };
}

/**
 * Build top-level IpGeoResponse from raw JSON payload.
 * @param {object} payload
 * @returns {IpGeoResponse}
 */
function toIpGeoResponse(payload) {
  const data = payload.data && typeof payload.data === 'object'
    ? toGeoData(payload.data)
    : null;
  // Preserve bulk responseArray (already mapped to IpGeoResponse objects by the caller).
  if (data && payload.data && Array.isArray(payload.data.responseArray)) {
    data.responseArray = payload.data.responseArray;
  }
  return {
    success: payload.success ?? false,
    data,
    message: payload.message ?? null,
  };
}

/**
 * Build one bulk result. The API sends bulk rows flat:
 * `{ success, ip, geoLocation, ... }`, or `{ success: false, ip, message }`.
 * @param {object} row
 * @returns {IpGeoResponse}
 */
function toBulkRow(row) {
  return {
    success: row.success ?? false,
    data: toGeoData(row),
    message: row.message ?? null,
  };
}

/**
 * Build query parameters for lookup / me endpoints.
 * The API key is not a query parameter: it is sent in a request header.
 * @param {string} format
 * @param {string|null} fields
 * @returns {Record<string,string>}
 */
function buildParams(format, fields) {
  /** @type {Record<string,string>} */
  const params = {};
  if (format !== 'json') {
    params.format = format;
  }
  if (fields) {
    params.get = fields;
  }
  return params;
}

/**
 * Best-effort extraction of an API error message from a Response.
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function errorMessage(response) {
  try {
    const body = await response.json();
    return body.message || response.statusText;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

// ── Client ───────────────────────────────────────────────────────────

export class IPWhoClient {
  /** @type {string} */
  #apiKey;
  /** @type {string} */
  #baseUrl;
  /** @type {number} */
  #timeout;

  static DEFAULT_BASE_URL = 'https://api.ipwho.org';

  /**
   * Create an IPWho API client.
   *
   * @param {string}  apiKey    - Your IPWho API key (required).
   * @param {object}  [options]
   * @param {string}  [options.baseUrl] - Override base URL (default {@link https://api.ipwho.org}).
   * @param {number}  [options.timeout] - Request timeout in ms (default 30000).
   */
  constructor(apiKey, options = {}) {
    const key = typeof apiKey === 'string' ? apiKey.trim() : '';
    if (!key) {
      throw new IPWhoError('apiKey is required');
    }
    // The key is sent in a header. Reject it here, without repeating it, rather
    // than let the HTTP client quote it in an error message.
    if (/[^\x20-\x7e]/.test(key)) {
      throw new IPWhoError('apiKey contains characters that are not allowed');
    }
    this.#apiKey = key;
    this.#baseUrl = (options.baseUrl || IPWhoClient.DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.#timeout = options.timeout ?? 30000;
  }

  // ── public API ──────────────────────────────────────────────────

  /**
   * Look up geolocation for a specific IPv4 or IPv6 address.
   *
   * @param {string}       ip            - The IP address.
   * @param {object}       [options]
   * @param {Format}       [options.format='json'] - Response format.
   * @param {string|string[]} [options.fields]     - Comma-separated or array of fields to return.
   * @returns {Promise<IpGeoResponse>}
   * @throws {InvalidIPError}      – 404
   * @throws {RateLimitError}      – 429
   * @throws {APIResponseError}    – other errors
   */
  async lookup(ip, options = {}) {
    const format = options.format || 'json';
    const fields = Array.isArray(options.fields) ? options.fields.join(',') : (options.fields || null);
    const params = buildParams(format, fields);
    return this.#get(`/ip/${encodeURIComponent(ip)}`, params, format);
  }

  /**
   * Look up geolocation for the caller's own IP address.
   *
   * @param {object}       [options]
   * @param {Format}       [options.format='json'] - Response format.
   * @param {string|string[]} [options.fields]     - Comma-separated or array of fields to return.
   * @returns {Promise<IpGeoResponse>}
   * @throws {APIResponseError}
   */
  async me(options = {}) {
    const format = options.format || 'json';
    const fields = Array.isArray(options.fields) ? options.fields.join(',') : (options.fields || null);
    const params = buildParams(format, fields);
    return this.#get('/me', params, format);
  }

  /**
   * Batch-lookup multiple IP addresses.
   *
   * @param {string[]} ips - List of IPv4 or IPv6 addresses.
   * @returns {Promise<IpGeoResponse>}  Response with `data.responseArray`: one
   *   `IpGeoResponse` per address. Check each row's `success`; a failed row has
   *   a `message`, and its `data` holds only the `ip`.
   * @throws {APIResponseError}
   */
  async bulk(ips) {
    if (!ips || ips.length === 0) {
      throw new IPWhoError('ips must not be empty');
    }
    const bulkParam = ips.join(',');
    return this.#get(`/bulk/${encodeURIComponent(bulkParam)}`, {}, 'json');
  }

  // ── internal ────────────────────────────────────────────────────

  /**
   * Execute a GET request and return a typed response.
   * @param {string} path
   * @param {Record<string,string>} params
   * @param {string} format
   * @returns {Promise<IpGeoResponse>}
   */
  async #get(path, params, format) {
    const url = new URL(`${this.#baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    /** @type {Response} */
    let response;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.#timeout);
    try {
      response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.#apiKey}`,
          'User-Agent': 'ipwho-js-sdk/1.0.0',
        },
      });
    } catch (err) {
      throw new APIResponseError(`Request failed: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    // Rate limit
    if (response.status === 429) {
      const msg = await errorMessage(response);
      throw new RateLimitError(msg);
    }

    // Not found
    if (response.status === 404) {
      const msg = await errorMessage(response);
      throw new InvalidIPError(msg);
    }

    // Other HTTP errors
    if (!response.ok) {
      const msg = await errorMessage(response);
      throw new APIResponseError(`HTTP ${response.status}: ${msg}`);
    }

    // Non-JSON: wrap raw text
    if (format !== 'json') {
      return {
        success: true,
        data: {
          ip: await response.text(),
          geoLocation: null,
          timezone: null,
          flag: null,
          currency: null,
          connection: null,
          security: null,
          userAgent: null,
        },
        message: null,
      };
    }

    // JSON success path
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new APIResponseError('Invalid JSON response');
    }

    // Even 200s can carry a logical error
    if (payload.success === false) {
      throw new APIResponseError(payload.message || 'API returned success=false');
    }

    // Bulk response: data contains responseArray
    if (payload.data && Array.isArray(payload.data.responseArray)) {
      payload.data.responseArray = payload.data.responseArray.map(toBulkRow);
    }

    return toIpGeoResponse(payload);
  }
}

// ── Example usage ─────────────────────────────────────────────────────

/*
import { IPWhoClient } from './ipwho-sdk.js';

async function main() {
  const apiKey = process.env.IPWHO_API_KEY || 'sk.xxxx';
  const client = new IPWhoClient(apiKey);

  // Single lookup
  const resp = await client.lookup('8.8.8.8');
  if (resp.data?.geoLocation) {
    const gl = resp.data.geoLocation;
    console.log(`IP: ${resp.data.ip}  |  ${gl.city}, ${gl.country} (${gl.latitude}, ${gl.longitude})`);
  }
  if (resp.data?.currency) {
    console.log(`Currency: ${resp.data.currency.code} (${resp.data.currency.symbol})`);
  }

  // Self lookup
  const me = await client.me();
  console.log(`\nMy IP: ${me.data?.ip ?? 'unknown'}`);

  // Bulk
  const bulk = await client.bulk(['8.8.8.8', '1.1.1.1']);
  if (bulk.data?.responseArray) {
    console.log(`\nBulk results: ${bulk.data.responseArray.length} items`);
  }
}

main().catch(console.error);
*/