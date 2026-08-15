export interface GeoLocation {
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
}

export interface Timezone {
  timeZone: string | null;
  abbr: string | null;
  offset: number | null;
  isDst: boolean | null;
  utc: string | null;
  currentTime: string | null;
}

export interface Flag {
  flagIcon: string | null;
  flagUnicode: string | null;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  namePlural: string;
  hexUnicode: string;
}

export interface Connection {
  asnNumber: number | null;
  asnOrg: string | null;
  isp: string | null;
  org: string | null;
  domain: string | null;
  connectionType: string | null;
}

export interface Security {
  isVpn: boolean;
  isTor: boolean;
  isThreat: string;
}

export interface UserAgentPart {
  name?: string;
  version?: string;
  type?: string;
  vendor?: string;
  model?: string;
  architecture?: string;
}

export interface UserAgent {
  browser: UserAgentPart;
  engine: UserAgentPart;
  os: UserAgentPart;
  device: UserAgentPart;
  cpu: UserAgentPart;
}

export interface GeoData {
  ip: string;
  geoLocation: GeoLocation | null;
  timezone: Timezone | null;
  flag: Flag | null;
  currency: Currency | null;
  connection: Connection | null;
  security: Security | null;
  userAgent: UserAgent | null;
  responseArray?: IpGeoResponse[];
}

export interface IpGeoResponse {
  success: boolean;
  data: GeoData | null;
  message: string | null;
}

export type Format = "json" | "xml" | "csv";

export interface LookupOptions {
  format?: Format;
  fields?: string | string[];
}

export interface ClientOptions {
  baseUrl?: string;
  timeout?: number;
}

export class IPWhoError extends Error {}
export class InvalidIPError extends IPWhoError {}
export class RateLimitError extends IPWhoError {}
export class APIResponseError extends IPWhoError {}

export class IPWhoClient {
  constructor(apiKey: string, options?: ClientOptions);
  lookup(ip: string, options?: LookupOptions): Promise<IpGeoResponse>;
  me(options?: LookupOptions): Promise<IpGeoResponse>;
  bulk(ips: string[]): Promise<IpGeoResponse>;
}
