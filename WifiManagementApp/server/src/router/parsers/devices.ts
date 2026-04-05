import * as cheerio from 'cheerio';

export interface DeviceEntry {
  name: string | null;
  ipv4: string | null;
  ipv6: string | null;
  mac: string | null;
  connectionType: string | null;
  band: string | null;
  online: boolean;
}

/**
 * Parse devices.ha HTML into a list of connected devices.
 * The page contains a table with columns:
 * Device Name | IPv4 Address | IPv6 Address | MAC Address | Connection Type
 */
export function parseDevices(html: string): DeviceEntry[] {
  try {
    const $ = cheerio.load(html);
    const devices: DeviceEntry[] = [];

    // Find all tables and look for one with device-like columns
    $('table').each((_, table) => {
      const headers: string[] = [];
      $(table)
        .find('tr')
        .first()
        .find('th, td')
        .each((_, cell) => {
          headers.push($(cell).text().trim().toLowerCase());
        });

      // Check if this looks like the devices table
      const hasDeviceCols =
        headers.some((h) => h.includes('device') || h.includes('name')) &&
        headers.some((h) => h.includes('mac'));

      if (!hasDeviceCols) return;

      // Map column indices
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('device'));
      const ipv4Idx = headers.findIndex((h) => h.includes('ipv4') || (h.includes('ip') && !h.includes('ipv6')));
      const ipv6Idx = headers.findIndex((h) => h.includes('ipv6'));
      const macIdx = headers.findIndex((h) => h.includes('mac'));
      const connIdx = headers.findIndex(
        (h) => h.includes('connection') || h.includes('type') || h.includes('interface')
      );

      // Parse data rows (skip header row)
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

          const connectionType = getCellText(connIdx);
          let band: string | null = null;

          if (connectionType) {
            const ct = connectionType.toLowerCase();
            if (ct.includes('5') || ct.includes('5ghz') || ct.includes('5 ghz')) {
              band = '5GHz';
            } else if (ct.includes('2.4') || ct.includes('2.4ghz') || ct.includes('2.4 ghz')) {
              band = '2.4GHz';
            } else if (ct.includes('6') || ct.includes('6ghz') || ct.includes('6 ghz')) {
              band = '6GHz';
            } else if (ct.toLowerCase().includes('wired') || ct.toLowerCase().includes('ethernet')) {
              band = 'Wired';
            } else if (ct.toLowerCase().includes('wifi') || ct.toLowerCase().includes('wi-fi')) {
              band = 'WiFi';
            }
          }

          const mac = getCellText(macIdx);
          if (!mac) return; // Skip rows without a MAC

          devices.push({
            name: getCellText(nameIdx),
            ipv4: getCellText(ipv4Idx),
            ipv6: getCellText(ipv6Idx),
            mac,
            connectionType,
            band,
            online: true, // All devices shown on this page are currently connected
          });
        });
    });

    return devices;
  } catch {
    return [];
  }
}
