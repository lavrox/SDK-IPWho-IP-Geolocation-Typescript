// Runs against a local stand-in server that replays recorded API responses.
// No API key and no network access are needed: `npm test`.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import {
  IPWhoClient, InvalidIPError, RateLimitError, APIResponseError,
} from '../src/ipwho.js';

const KEY = 'sk.test_secret_value';
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8');

let server;
let client;
let requests = [];
let reply = { status: 200, body: '{}' };

before(async () => {
  server = createServer((req, res) => {
    requests.push({ url: req.url, headers: req.headers });
    res.writeHead(reply.status, { 'Content-Type': 'application/json' });
    res.end(reply.body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  client = new IPWhoClient(KEY, { baseUrl: `http://127.0.0.1:${server.address().port}` });
});

after(() => server.close());
beforeEach(() => { requests = []; reply = { status: 200, body: fixture('lookup') }; });

test('the key goes in the Authorization header, never in the URL', async () => {
  await client.lookup('8.8.8.8');
  await client.me();
  reply = { status: 200, body: fixture('bulk') };
  await client.bulk(['8.8.8.8', '1.1.1.1']);
  assert.equal(requests.length, 3);
  for (const r of requests) {
    assert.equal(r.headers.authorization, `Bearer ${KEY}`);
    assert.ok(!r.url.includes(KEY), r.url);
    assert.ok(!/api_?key/i.test(r.url), r.url);
  }
});

test('lookup maps the response', async () => {
  const { data } = await client.lookup('8.8.8.8');
  assert.equal(requests[0].url, '/ip/8.8.8.8');
  assert.equal(data.ip, '8.8.8.8');
  assert.equal(data.geoLocation.country, 'United States');
  assert.equal(data.geoLocation.countryCode, 'US');
  assert.equal(data.geoLocation.dialCode, '+1');
  assert.equal(data.connection.asnNumber, 15169);
  assert.equal(data.timezone.timeZone, 'America/Chicago');
  assert.equal(data.currency.code, 'USD');
});

test('lookup accepts a null currency', async () => {
  reply = { status: 200, body: fixture('lookup-null-currency') };
  const { data } = await client.lookup('1.1.1.1');
  assert.equal(data.ip, '1.1.1.1');
  assert.equal(data.currency, null);
});

test('bulk returns the data for every address', async () => {
  reply = { status: 200, body: fixture('bulk') };
  const rows = (await client.bulk(['8.8.8.8', '1.1.1.1', '192.168.0.1', '9.9.9.9'])).data.responseArray;
  assert.equal(rows.length, 4);

  assert.equal(rows[0].success, true);
  assert.equal(rows[0].data.ip, '8.8.8.8');
  assert.equal(rows[0].data.geoLocation.country, 'United States');
  assert.equal(rows[0].data.connection.asnNumber, 15169);

  assert.equal(rows[1].success, true);
  assert.equal(rows[1].data.ip, '1.1.1.1');
  assert.equal(rows[1].data.currency, null);
  assert.equal(rows[1].data.connection.asnNumber, 13335);

  assert.equal(rows[2].success, false);
  assert.equal(rows[2].data.ip, '192.168.0.1');
  assert.equal(rows[2].data.geoLocation, null);
  assert.equal(rows[2].message, 'Reserved range/Invalid IP address');

  assert.equal(rows[3].success, false);
  assert.equal(rows[3].data.ip, '9.9.9.9');
  assert.match(rows[3].message, /quota/);
});

test('fields and format are the only query parameters', async () => {
  await client.lookup('8.8.8.8', { fields: ['geoLocation', 'timezone'] });
  assert.equal(requests[0].url, '/ip/8.8.8.8?get=geoLocation%2Ctimezone');
  reply = { status: 200, body: 'ip,8.8.8.8' };
  const res = await client.lookup('8.8.8.8', { format: 'csv' });
  assert.equal(requests[1].url, '/ip/8.8.8.8?format=csv');
  assert.equal(res.data.ip, 'ip,8.8.8.8');
});

for (const [status, body, type] of [
  [404, '{"success":false,"message":"Reserved range/Invalid IP address"}', InvalidIPError],
  [429, '{"error":"rate_limit_exceeded"}', RateLimitError],
  [401, '{"error":"invalid_api_key"}', APIResponseError],
]) {
  test(`HTTP ${status} throws ${type.name}`, async () => {
    reply = { status, body };
    await assert.rejects(client.lookup('8.8.8.8'), (err) => {
      assert.ok(err instanceof type, err.constructor.name);
      assert.ok(!err.message.includes(KEY));
      if (status === 401) assert.match(err.message, /invalid_api_key/);
      return true;
    });
  });
}

test('a connection failure throws APIResponseError without the key', async () => {
  const unreachable = new IPWhoClient(KEY, { baseUrl: 'http://127.0.0.1:1' });
  await assert.rejects(unreachable.lookup('8.8.8.8'), (err) => {
    assert.ok(err instanceof APIResponseError, err.constructor.name);
    assert.ok(!String(err.stack).includes(KEY));
    return true;
  });
});

test('a key with surrounding whitespace is trimmed', async () => {
  const padded = new IPWhoClient(`  ${KEY}\n`, { baseUrl: `http://127.0.0.1:${server.address().port}` });
  await padded.lookup('8.8.8.8');
  assert.equal(requests[0].headers.authorization, `Bearer ${KEY}`);
});

test('a key with invalid characters is rejected without repeating it', () => {
  assert.throws(() => new IPWhoClient('sk.secret_part\nmore'), (err) => {
    assert.ok(!err.message.includes('secret_part'), err.message);
    return true;
  });
  assert.throws(() => new IPWhoClient('  \n'), /apiKey is required/);
});
