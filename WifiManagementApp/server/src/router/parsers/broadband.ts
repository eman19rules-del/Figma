import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface BroadbandStats {
  lineState: string | null;
  lineSpeed: string | null;
  rxBytes: number | null;
  txBytes: number | null;
  rxPackets: number | null;
  txPackets: number | null;
  rxErrors: number | null;
  txErrors: number | null;
  ipv4: string | null;
  ipv6: string | null;
  dns: string | null;
}

/**
 * Parse a numeric string (possibly with commas) into a number, or null
 */
function parseNum(val: string | null | undefined): number | null {
  if (!val) return null;
  const cleaned = val.replace(/,/g, '').trim();
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

/**
 * Build a lookup map from row label -> cell value from a table
 */
function buildTableMap($: cheerio.CheerioAPI, table: Element): Map<string, string> {
  const map = new Map<string, string>();
  $(table)
    .find('tr')
    .each((_, row) => {
      const cells = $(row).find('td, th');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        if (label) map.set(label, value);
      }
    });
  return map;
}

/**
 * Parse broadbandstatistics.ha HTML
 */
export function parseBroadband(html: string): BroadbandStats {
  const result: BroadbandStats = {
    lineState: null,
    lineSpeed: null,
    rxBytes: null,
    txBytes: null,
    rxPackets: null,
    txPackets: null,
    rxErrors: null,
    txErrors: null,
    ipv4: null,
    ipv6: null,
    dns: null,
  };

  try {
    const $ = cheerio.load(html);

    // Aggregate all label->value pairs from all tables
    const allData = new Map<string, string>();
    $('table').each((_, table) => {
      const map = buildTableMap($, table);
      map.forEach((v, k) => allData.set(k, v));
    });

    // Helper to find value by partial key match
    const find = (partial: string): string | null => {
      for (const [k, v] of allData) {
        if (k.includes(partial)) return v;
      }
      return null;
    };

    result.lineState = find('line state') ?? find('link state') ?? find('status');
    result.lineSpeed = find('line speed') ?? find('link speed');
    result.rxBytes = parseNum(find('receive byte') ?? find('ipv4 receive byte') ?? find('rx byte'));
    result.txBytes = parseNum(find('transmit byte') ?? find('ipv4 transmit byte') ?? find('tx byte'));
    result.rxPackets = parseNum(find('receive packet') ?? find('ipv4 receive packet') ?? find('rx packet'));
    result.txPackets = parseNum(find('transmit packet') ?? find('ipv4 transmit packet') ?? find('tx packet'));
    result.rxErrors = parseNum(find('receive error') ?? find('rx error'));
    result.txErrors = parseNum(find('transmit error') ?? find('tx error'));
    result.ipv4 = find('ipv4 address') ?? find('wan ipv4') ?? find('ip address');
    result.ipv6 = find('ipv6 address') ?? find('wan ipv6');
    result.dns = find('dns');
  } catch {
    // Return partial result on error
  }

  return result;
}
