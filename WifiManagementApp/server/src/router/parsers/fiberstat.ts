import * as cheerio from 'cheerio';

export interface FiberStat {
  temperature: string | null;
  voltage: string | null;
  txBias: string | null;
  txPower: string | null;
  rxPower: string | null;
}

/**
 * Parse fiberstat.ha HTML — optical transceiver stats
 */
export function parseFiberstat(html: string): FiberStat {
  const result: FiberStat = {
    temperature: null,
    voltage: null,
    txBias: null,
    txPower: null,
    rxPower: null,
  };

  try {
    const $ = cheerio.load(html);

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

    result.temperature = find('temperature') ?? find('temp');
    result.voltage = find('vcc') ?? find('voltage') ?? find('supply voltage');
    result.txBias = find('tx bias') ?? find('bias current') ?? find('laser bias');
    result.txPower = find('tx power') ?? find('transmit power') ?? find('optical tx');
    result.rxPower = find('rx power') ?? find('receive power') ?? find('optical rx');
  } catch {
    // Return partial result on error
  }

  return result;
}
