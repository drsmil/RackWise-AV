/**
 * WattBox UPS and power-strip records imported from the supplied distributor
 * export. Prices and product URLs are intentionally set by commercialCatalog
 * after import, once a Snap One or ADI listing is verified.
 */
const wattboxRecordRows: ReadonlyArray<readonly [string, string, string]> = [
  ["WB-100-PS-6", "842822023689", "WattBox Power Strip - 6 Outlets"],
  [
    "WB-100-RSW-8",
    "842822023672",
    "WattBox Rack Mount Power Strip w/ 8 Individual Switches",
  ],
  [
    "WB-100-VPS-12",
    "842822020558",
    "WattBox Vertical Rack Mount Power Strip - 12 Outlet - 15 AMP",
  ],
  [
    "WB-100-VPS-20",
    "842822020565",
    "WattBox Vertical Rack Mount Power Strip - 20 Outlet - 15 AMP",
  ],
  [
    "WB-100-VPS-6",
    "842822020534",
    "WattBox Vertical Rack Mount Power Strip - 6 Outlet - 15 AMP",
  ],
  [
    "WB-100-VPS-8",
    "842822020541",
    "WattBox Vertical Rack Mount Power Strip - 8 Outlet - 15 AMP",
  ],
  [
    "WB-150-IPW-1B-2",
    "842822041003",
    "WattBox IP Power Strip with Wi-Fi - 1 Controlled Bank",
  ],
  ["WB-200-8PS", "842822020589", "WattBox Power Strip with 8 Outlets"],
  [
    "WB-250-IPW-2",
    "842822041010",
    "WattBox IP Power Strip & Surge Protector with Wi-Fi - 2 Controlled Banks",
  ],
  [
    "WB-800VPS-IPVM-12",
    "842822038836",
    "WattBox IP Vertical Power Strip & Conditioner - 12 Individually Controlled Outlets",
  ],
  [
    "WB-800VPS-IPVM-18",
    "842822038843",
    "WattBox IP Vertical Power Strip & Conditioner - 18 Individually Controlled Outlets",
  ],
  [
    "WB-OVRC-UPS-350-6",
    "842822040952",
    "WattBox Stand-by UPS & Battery Pack for IP Power Conditioner",
  ],
  [
    "WB-OVRC-UPS-625-8",
    "842822040969",
    "WattBox Stand-by UPS & Battery Pack for IP Power Conditioner",
  ],
  [
    "WB-OVRC-UPS-850-8",
    "842822040976",
    "WattBox Stand-by UPS & Battery Pack for IP Power Conditioner",
  ],
  [
    "WB-UPS-1100-8",
    "842822034593",
    "WattBox Uninterruptible Power Supply - 8 Outlets - 1100 VA",
  ],
  [
    "WB-UPS-1500-8",
    "842822034609",
    "WattBox Uninterruptible Power Supply - 8 Outlets - 1500 VA",
  ],
  [
    "WB-UPS-2000-8",
    "842822034616",
    "WattBox Uninterruptible Power Supply - 8 Outlets - 2000 VA",
  ],
];

export const wattboxCatalogRecords = wattboxRecordRows.map(
  ([sku, upc, description]) => ({
    sku,
    upc,
    description,
    manufacturer: "WattBox" as const,
    kind: "device" as const,
    rack_height_u: null,
    rack_depth_in: null,
    form_factor: null,
    source_file: "wattbox power.xlsx",
  }),
);
