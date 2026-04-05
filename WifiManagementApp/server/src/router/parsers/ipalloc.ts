import * as cheerio from 'cheerio';

export interface IpAllocEntry {
  name: string | null;
  mac: string | null;
  ip: string | null;
  method: string | null; // "DHCP", "Static", etc.
}

/**
 * Parse ipalloc.ha HTML — DHCP/IP allocation table
 * Typical columns: Device Name | MAC Address | IP Address | Allocation Method
 */
export function parseIpalloc(html: string): IpAllocEntry[] {
  try {
    const $ = cheerio.load(html);
    const entries: IpAllocEntry[] = [];

    $('table').each((_, table) => {
      const headers: string[] = [];
      $(table)
        .find('tr')
        .first()
        .find('th, td')
        .each((_, cell) => {
          headers.push($(cell).text().trim().toLowerCase());
        });

      const hasRelevantCols =
        headers.some((h) => h.includes('mac')) &&
        headers.some((h) => h.includes('ip'));

      if (!hasRelevantCols) return;

      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('device'));
      const macIdx = headers.findIndex((h) => h.includes('mac'));
      const ipIdx = headers.findIndex((h) => h.includes('ip') && !h.includes('ipv6'));
      const methodIdx = headers.findIndex(
        (h) => h.includes('method') || h.includes('allocation') || h.includes('type')
      );

      $(table)
        .find('tr')
        .slice(1)
        .each((_, row) => {
          const cells = $(row).find('td');
          if (cells.length === 0) return;

          const getCellText = (idx: number): string | null => {
            if (idx < 0 || idx >= cells.length) return null;
            const text = $(cells[idx]).text().trim();
            return text || null;
          };

          const mac = getCellText(macIdx);
          if (!mac) return;

          entries.push({
            name: getCellText(nameIdx),
            mac,
            ip: getCellText(ipIdx),
            method: getCellText(methodIdx),
          });
        });
    });

    return entries;
  } catch {
    return [];
  }
}
