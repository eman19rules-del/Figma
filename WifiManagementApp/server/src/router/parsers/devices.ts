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
 * Parse band from connection type string like:
 *   "Wi-Fi 5 GHz Radio-1 Type: Home Name: ATTTXp6ey5"
 *   "Wi-Fi 2.4 GHz Radio-1 Type: Home Name: ATT..."
 *   "Wired"
 */
function parseBand(connectionType: string | null): string | null {
  if (!connectionType) return null;
  const ct = connectionType.toLowerCase();
  if (ct.includes('5 ghz') || ct.includes('5ghz')) return '5GHz';
  if (ct.includes('2.4 ghz') || ct.includes('2.4ghz')) return '2.4GHz';
  if (ct.includes('6 ghz') || ct.includes('6ghz')) return '6GHz';
  if (ct.includes('wired') || ct.includes('ethernet')) return 'Wired';
  if (ct.includes('wi-fi') || ct.includes('wifi')) return 'WiFi';
  return null;
}

/**
 * Parse devicelist.ha or devices.ha HTML.
 *
 * The BGW320 renders each device as a block of <th>Label</th><td>Value</td> rows
 * inside a single big table, with <tr><td><hr></td></tr> rows separating devices.
 *
 * Online devices have an "IPv4 Address / Name" key (value: "192.168.1.x / hostname")
 * instead of separate Name and IPv4 fields.
 * Offline devices have a "Name" key and no IP.
 * Status is in a "Status" row with value "on" or "off".
 */
export function parseDevices(html: string): DeviceEntry[] {
  try {
    const $ = cheerio.load(html);
    const devices: DeviceEntry[] = [];

    // Collect all rows from the page's tables into a flat list
    // We'll split them into device blocks on <hr> rows
    interface Row { label: string; value: string }
    const allRows: (Row | 'separator')[] = [];

    $('table tr').each((_, tr) => {
      const th = $(tr).find('th').first();
      const td = $(tr).find('td').first();

      // Check if this is a separator row (<td><hr></td>)
      if (td.find('hr').length > 0 && th.length === 0) {
        allRows.push('separator');
        return;
      }

      const label = th.text().trim().toLowerCase();
      const value = td.text().replace(/\s+/g, ' ').trim();

      if (label) {
        allRows.push({ label, value });
      }
    });

    // Split into device blocks by separator
    const blocks: Row[][] = [];
    let current: Row[] = [];
    for (const row of allRows) {
      if (row === 'separator') {
        if (current.length > 0) blocks.push(current);
        current = [];
      } else {
        current.push(row);
      }
    }
    if (current.length > 0) blocks.push(current);

    for (const block of blocks) {
      if (block.length === 0) continue;

      const get = (partial: string): string | null => {
        const found = block.find((r) => r.label.includes(partial));
        return found ? found.value || null : null;
      };

      const mac = get('mac address') ?? get('mac');
      if (!mac) continue; // Skip blocks without a MAC address

      // Online devices: "IPv4 Address / Name" => "192.168.1.x / hostname"
      const ipv4NameField = get('ipv4 address / name');
      let name: string | null = null;
      let ipv4: string | null = null;

      if (ipv4NameField) {
        const parts = ipv4NameField.split('/');
        ipv4 = parts[0]?.trim() || null;
        name = parts[1]?.trim() || null;
      } else {
        name = get('name');
        ipv4 = get('ipv4 address') ?? get('ip address');
      }

      const statusVal = get('status');
      const online = statusVal ? statusVal.toLowerCase() === 'on' : ipv4 !== null;

      // Connection type may be in a <pre> tag — cheerio .text() still gets the text
      const connectionType = get('connection type');
      const band = parseBand(connectionType);

      const ipv6 = get('ipv6 address') ?? get('ipv6');

      devices.push({ name, ipv4, ipv6, mac, connectionType, band, online });
    }

    return devices;
  } catch {
    return [];
  }
}
