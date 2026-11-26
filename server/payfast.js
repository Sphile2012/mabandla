import crypto from 'node:crypto';

export const pfEncode = (value) => encodeURIComponent(String(value).trim()).replace(/%20/g, '+');

export function generatePayfastSignature(data, passphrase) {
  let parameterString = '';
  for (const [key, value] of Object.entries(data)) {
    if (value !== '' && value !== undefined && value !== null) {
      parameterString += `${key}=${pfEncode(value)}&`;
    }
  }

  parameterString = parameterString.slice(0, -1);
  if (passphrase !== null && passphrase !== undefined) {
    parameterString += `&passphrase=${pfEncode(passphrase)}`;
  }

  return crypto.createHash('md5').update(parameterString).digest('hex');
}
