import * as cheerio from 'cheerio';

export interface SysInfo {
  manufacturer: string | null;
  model: string | null;
  firmware: string | null;
  serial: string | null;
  uptime: string | null;
  uptimeSeconds: number | null;
}

/**
 * Convert an uptime string like "3 days, 4:12:55" or "4:12:55" to seconds
 */
function parseUptimeSeconds(uptime: string | null): number | null {
  if (!uptime) return null;

  let totalSeconds = 0;

  // Match days
  const dayMatch = uptime.match(/(\d+)\s*day/i);
  if (dayMatch) {
    totalSeconds += parseInt(dayMatch[1], 10) * 86400;
  }

  // Match HH:MM:SS
  const timeMatch = uptime.match(/(\d+):(\d+):(\d+)/);
  if (timeMatch) {
    totalSeconds += parseInt(timeMatch[1], 10) * 3600;
    totalSeconds += parseInt(timeMatch[2], 10) * 60;
    totalSeconds += parseInt(timeMatch[3], 10);
  }

  // Match hours/minutes/seconds if no colon format
  if (!timeMatch) {
    const hourMatch = uptime.match(/(\d+)\s*hour/i);
    const minMatch = uptime.match(/(\d+)\s*min/i);
    const secMatch = uptime.match(/(\d+)\s*sec/i);
    if (hourMatch) totalSeconds += parseInt(hourMatch[1], 10) * 3600;
    if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;
    if (secMatch) totalSeconds += parseInt(secMatch[1], 10);
  }

  return totalSeconds > 0 ? totalSeconds : null;
}

/**
 * Parse sysinfo.ha HTML
 */
export function parseSysinfo(html: string): SysInfo {
  const result: SysInfo = {
    manufacturer: null,
    model: null,
    firmware: null,
    serial: null,
    uptime: null,
    uptimeSeconds: null,
  };

  try {
    const $ = cheerio.load(html);

    // Build label->value map from all tables
    const allData = new Map<string, string>();
    $('table').each((_, table) => {
      $(table)
        .find('tr')
        .each((_, row) => {
          const cells = $(row).find('td, th');
          if (cells.length >= 2) {
            const label = $(cells[0]).text().trim().toLowerCase();
            const value = $(cells[1]).text().trim();
            if (label) allData.set(label, value);
          }
        });
    });

    const find = (partial: string): string | null => {
      for (const [k, v] of allData) {
        if (k.includes(partial)) return v;
      }
      return null;
    };

    result.manufacturer = find('manufacturer') ?? find('vendor');
    result.model = find('model number') ?? find('model name') ?? find('model') ?? find('product');
    result.firmware = find('firmware version') ?? find('firmware') ?? find('software version');
    result.serial = find('serial number') ?? find('serial');
    result.uptime = find('up time') ?? find('uptime');
    result.uptimeSeconds = parseUptimeSeconds(result.uptime);
  } catch {
    // Return partial result on error
  }

  return result;
}
