import { PRINTIFY_API_BASE, PRINTIFY_TOKEN } from '../config';

const json = (r) => r.json();

export async function printifyFetch(path, opts = {}) {
  const url = `${PRINTIFY_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PRINTIFY_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    },
    ...opts
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Printify error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  
  return json(res);
}