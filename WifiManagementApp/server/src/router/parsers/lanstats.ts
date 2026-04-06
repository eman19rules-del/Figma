import * as cheerio from 'cheerio';

export interface LanPortStat {
  port: string;
  rxBytes: number | null;
  txBytes: number | null;
  rxPackets: number | null;
  txPackets: number | null;
  rxErrors: number | null;
  txErrors: number | null;
  speed: string | null;
  duplex: string | null;
  state: string | null;
}

function parseNum(val: string | null | undefined): number | null {
  if (!val) return null;
  const n = Number(val.replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
}

/**
 * Parse lanstatistics.ha HTML — per-port LAN Ethernet stats
 */
export function parseLanstats(html: string): LanPortStat[] {
  try {
    const $ = cheerio.load(html);
    const ports: LanPortStat[] = [];

    $('table').each((_, table) => {
      const headers: string[] = [];
      $(table)
        .find('tr')
        .first()
        .find('th, td')
        .each((_, cell) => {
          headers.push($(cell).text().trim().toLowerCase());
        });

      // Look for a table that has port or interface columns
      const hasPortCol = headers.some(
        (h) => h.includes('port') || h.includes('interface') || h.includes('lan')
      );
      const hasStatCol = headers.some(
        (h) => h.includes('byte') || h.includes('packet') || h.includes('rx') || h.includes('tx')
      );

      if (!hasPortCol && !hasStatCol) return;

      const portIdx = headers.findIndex(
        (h) => h.includes('port') || h.includes('interface') || h.includes('lan')
      );
      const rxBytesIdx = headers.findIndex((h) => h.includes('rx') && h.includes('byte'));
      const txBytesIdx = headers.findIndex((h) => h.includes('tx') && h.includes('byte'));
      const rxPktIdx = headers.findIndex((h) => h.includes('rx') && h.includes('packet'));
      const txPktIdx = headers.findIndex((h) => h.includes('tx') && h.includes('packet'));
      const rxErrIdx = headers.findIndex((h) => h.includes('rx') && h.includes('error'));
      const txErrIdx = headers.findIndex((h) => h.includes('tx') && h.includes('error'));
      const speedIdx = headers.findIndex((h) => h.includes('speed'));
      const duplexIdx = headers.findIndex((h) => h.includes('duplex'));
      const stateIdx = headers.findIndex((h) => h.includes('state') || h.includes('status') || h.includes('link'));

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

          const portName = getCellText(portIdx) ?? `Port ${ports.length + 1}`;

          ports.push({
            port: portName,
            rxBytes: parseNum(getCellText(rxBytesIdx)),
            txBytes: parseNum(getCellText(txBytesIdx)),
            rxPackets: parseNum(getCellText(rxPktIdx)),
            txPackets: parseNum(getCellText(txPktIdx)),
            rxErrors: parseNum(getCellText(rxErrIdx)),
            txErrors: parseNum(getCellText(txErrIdx)),
            speed: getCellText(speedIdx),
            duplex: getCellText(duplexIdx),
            state: getCellText(stateIdx),
          });
        });
    });

    return ports;
  } catch {
    return [];
  }
}
