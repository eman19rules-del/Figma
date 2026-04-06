import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const ROUTER_IP = process.env.ROUTER_IP || '192.168.1.254';
const BASE_URL = `http://${ROUTER_IP}/cgi-bin`;

// Create a persistent cookie jar for session management
export const cookieJar = new CookieJar();

// Create axios instance with cookie jar support
export const routerClient: AxiosInstance = wrapper(
  axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    jar: cookieJar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WifiManagementApp/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })
);

/**
 * Hit the router root to establish a SessionID cookie before login
 */
export async function initSession(): Promise<void> {
  // First GET to login.ha sets the SessionID cookie; the response itself has no nonce.
  await routerClient.get('/login.ha', { timeout: 5000, responseType: 'text' }).catch(() => {});
}

/**
 * Perform a GET request to a router .ha page
 * @param timeoutMs Optional per-request timeout override (default: 10000ms)
 */
export async function getPage(page: string, timeoutMs?: number): Promise<string> {
  const response = await routerClient.get(`/${page}`, {
    responseType: 'text',
    ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
  });
  return response.data as string;
}

/**
 * POST without following redirects — returns { status, location }
 * Used for login where a 302 to home.ha signals success.
 */
export async function postPageRaw(
  page: string,
  fields: Record<string, string>
): Promise<{ status: number; location: string | null; body: string }> {
  const params = new URLSearchParams(fields);
  const response = await routerClient.post(`/${page}`, params.toString(), {
    responseType: 'text',
    maxRedirects: 0,
    validateStatus: (s) => s < 400,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: `http://${ROUTER_IP}/cgi-bin/${page}`,
    },
  });
  return {
    status: response.status,
    location: (response.headers['location'] as string) ?? null,
    body: response.data as string,
  };
}

/**
 * Perform a POST request to a router .ha page with form data
 */
export async function postPage(
  page: string,
  fields: Record<string, string>
): Promise<string> {
  const params = new URLSearchParams(fields);
  const response = await routerClient.post(`/${page}`, params.toString(), {
    responseType: 'text',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: `http://${ROUTER_IP}/cgi-bin/${page}`,
    },
  });
  return response.data as string;
}
