import { IPWhoClient, IPWhoError, InvalidIPError, APIResponseError, RateLimitError } from './src/ipwho.js';

const KEY = process.env.IPWHO_API_KEY;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.log('  FAIL', m); } };

const c = new IPWhoClient(KEY);

// 1. lookup
const r = await c.lookup('8.8.8.8');
const d = r.data;
const gl = d.geoLocation, tz = d.timezone, fl = d.flag, cu = d.currency, cn = d.connection;
ok(d.ip === '8.8.8.8', 'lookup ip == 8.8.8.8');
ok(gl.country === 'United States', `lookup country == United States (got ${gl.country})`);
ok(cn.asnNumber === 15169, `lookup asnNumber == 15169 (got ${cn.asnNumber})`);
// inconsistent-casing fields must be captured
ok(gl.dialCode != null, `dial_code captured (${gl.dialCode})`);
ok(gl.isInEu != null, `is_in_eu captured (${gl.isInEu})`);
ok(gl.accuracyRadius != null, `accuracy_radius captured (${gl.accuracyRadius})`);
ok(tz.timeZone != null, `time_zone captured (${tz.timeZone})`);
ok(fl.flagIcon != null, `flag_Icon captured (${fl.flagIcon})`);
ok(fl.flagUnicode != null, `flag_unicode captured (${fl.flagUnicode})`);
ok(cu.namePlural != null, `name_plural captured (${cu.namePlural})`);
ok(cn.asnOrg != null, `asn_org captured (${cn.asnOrg})`);
ok(cn.connectionType != null, `connection_type captured (${cn.connectionType})`);

// 2. me
const me = await c.me();
ok(me.data.ip != null, `me ip captured (${me.data.ip})`);

// 3. bulk
const b = await c.bulk(['8.8.8.8', '1.1.1.1']);
ok(b.data.responseArray.length === 2, `bulk returns 2 (${b.data.responseArray.length})`);

// 4. bad key
try {
  await new IPWhoClient('sk.invalid_test_key').lookup('8.8.8.8');
  ok(false, 'bad key should raise');
} catch (e) {
  ok(e instanceof IPWhoError || e instanceof APIResponseError || e instanceof InvalidIPError,
     `bad key raised ${e.constructor.name}`);
}

console.log(`\nJS RESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
