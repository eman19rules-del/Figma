import * as cheerio from 'cheerio';
import md5 from 'md5';
import { getPage, postPage, postPageRaw, initSession } from './client';

let isAuthenticated = false;
let authError: string | null = null;

export function getAuthState(): { authenticated: boolean; error: string | null } {
  return { authenticated: isAuthenticated, error: authError };
}

/**
 * Parse the 64-char nonce from the login.ha page HTML
 */
function parseNonce(html: string): string | null {
  const $ = cheerio.load(html);

  // The nonce is typically in a hidden input or a JS variable
  // Try hidden input first
  const nonceInput = $('input[name="nonce"]').val();
  if (nonceInput && typeof nonceInput === 'string' && nonceInput.length === 64) {
    return nonceInput;
  }

  // Try to find it in a script tag as a variable
  let nonce: string | null = null;
  $('script').each((_, el) => {
    const scriptText = $(el).html() || '';
    // Look for patterns like: var nonce = "abc123..."; or nonce="abc123..."
    const match =
      scriptText.match(/['"]([\da-fA-F]{64})['"]/);
    if (match) {
      nonce = match[1];
      return false; // break
    }
  });

  if (nonce) return nonce;

  // Also try to find it inline in the page source as a raw 64-char hex string
  const rawMatch = html.match(/['"]([\da-fA-F]{64})['"]/);
  if (rawMatch) {
    return rawMatch[1];
  }

  return null;
}

/**
 * Perform the login flow:
 * 1. GET login.ha to obtain the nonce
 * 2. Compute MD5(deviceAccessCode + nonce)
 * 3. POST login.ha with credentials
 */
export async function login(deviceAccessCode: string): Promise<{ success: boolean; message: string }> {
  try {
    // Step 1: Establish session cookie — first GET returns "cookies required", sets SessionID.
    // Retry once if the second GET doesn't return a nonce (session may not have been set yet).
    await initSession();
    let loginHtml = await getPage('login.ha');
    let nonce = parseNonce(loginHtml);

    if (!nonce) {
      // Retry: establish a fresh session and try again
      await initSession();
      loginHtml = await getPage('login.ha');
      nonce = parseNonce(loginHtml);
    }

    if (!nonce) {
      isAuthenticated = false;
      authError = 'Could not parse nonce from login page';
      return { success: false, message: authError };
    }

    // Step 2: Compute hash
    const hashpassword = md5(deviceAccessCode + nonce);

    // Step 3: POST login with credentials
    // password field is typically sent as asterisks matching length
    const passwordMasked = '*'.repeat(deviceAccessCode.length);

    const { status, location } = await postPageRaw('login.ha', {
      nonce,
      password: passwordMasked,
      hashpassword,
      Continue: 'Continue',
    });

    // Success = 302 redirect away from login.ha (typically to home.ha)
    if (status === 302 && location && !location.includes('login.ha')) {
      isAuthenticated = true;
      authError = null;
      return { success: true, message: 'Authentication successful' };
    }

    isAuthenticated = false;
    authError = 'Authentication failed — invalid access code';
    return { success: false, message: authError };
  } catch (err: unknown) {
    isAuthenticated = false;
    const message = err instanceof Error ? err.message : String(err);
    authError = `Login error: ${message}`;
    return { success: false, message: authError };
  }
}

/**
 * Perform a router action via POST to resets.ha
 */
export async function performAction(action: string): Promise<{ success: boolean; message: string }> {
  if (!isAuthenticated) {
    return { success: false, message: 'Not authenticated — call /api/auth first' };
  }

  const validActions = [
    'reset-connection',
    'restart-gateway',
    'reset-wifi',
    'reset-firewall',
    'reset-device',
    'reset-ip',
  ];

  if (!validActions.includes(action)) {
    return { success: false, message: `Unknown action: ${action}` };
  }

  try {
    await postPage('resets.ha', { action });
    return { success: true, message: `Action '${action}' submitted successfully` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Action failed: ${message}` };
  }
}
