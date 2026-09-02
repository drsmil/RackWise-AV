/**
 * RackWise AV bill-of-materials builder.
 *
 * This module is deliberately independent of Svelte and the layout store so
 * the same result can feed the in-app review, print output, and future quote
 * integrations without changing the commercial calculation rules.
 */

import type {
  CatalogAvailability,
  DeviceType,
  Layout,
  Rack,
  VendorOffer,
} from "$lib/types";
import { findDeviceType } from "$lib/utils/device-lookup";

export type BomLineKind = "rack" | "device" | "accessory" | "missing";

export type BomLineStatus =
  "ready" | "unverified" | "unpriced" | "unavailable" | "unlinked";

export interface BomLine {
  /** Stable grouping key for the current layout. */
  key: string;
  kind: BomLineKind;
  name: string;
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  upc?: string;
  quantity: number;
  /** The selected distributor listing, if the catalog identifies one. */
  offer?: VendorOffer;
  /** A transparent state that prevents misleading purchase totals. */
  status: BomLineStatus;
  /** Unit price only when the selected offer has a verified price. */
  unitPrice: number | null;
  /** quantity x unitPrice, otherwise null. */
  extendedPrice: number | null;
  /** Device names that caused this accessory to be included. */
  requiredBy: string[];
}

export interface BillOfMaterials {
  layoutName: string;
  lines: BomLine[];
  /** Sum of every verified, priced line. Null when a purchasable line is incomplete. */
  total: number | null;
  pricedSubtotal: number;
  unpricedLineCount: number;
  unavailableLineCount: number;
}

const AVAILABILITY_RANK: Record<CatalogAvailability, number> = {
  "in-stock": 0,
  limited: 1,
  unknown: 2,
  "out-of-stock": 3,
};

const VENDOR_RANK: Record<VendorOffer["vendor"], number> = {
  "snap-one": 0,
  adi: 1,
  other: 2,
};

function isVerified(offer: VendorOffer): boolean {
  return (
    offer.last_verified_at !== undefined && offer.last_verified_at !== null
  );
}

/**
 * Choose the best listing without treating a demo or stale entry as verified.
 * A verified, available listing wins; then price and RackWise distributor
 * priority make the choice deterministic.
 */
export function selectPreferredOffer(
  offers: VendorOffer[] | undefined,
): VendorOffer | undefined {
  if (!offers || offers.length === 0) return undefined;

  return [...offers].sort((a, b) => {
    const verified = Number(isVerified(b)) - Number(isVerified(a));
    if (verified !== 0) return verified;

    const availability =
      AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability];
    if (availability !== 0) return availability;

    const priced = Number(b.price !== null) - Number(a.price !== null);
    if (priced !== 0) return priced;

    if (a.price !== null && b.price !== null && a.price !== b.price) {
      return a.price - b.price;
    }

    return VENDOR_RANK[a.vendor] - VENDOR_RANK[b.vendor];
  })[0];
}

function lineStatus(offer: VendorOffer | undefined): BomLineStatus {
  if (!offer) return "unlinked";
  if (offer.availability === "out-of-stock") return "unavailable";
  if (!isVerified(offer)) return "unverified";
  if (offer.price === null) return "unpriced";
  return "ready";
}

function displayName(
  item: Pick<DeviceType, "manufacturer" | "model" | "part_number" | "slug">,
): string {
  return (
    [item.manufacturer, item.model].filter(Boolean).join(" ") ||
    item.part_number ||
    item.slug
  );
}

function rackDisplayName(rack: Rack): string {
  return (
    [rack.manufacturer, rack.model].filter(Boolean).join(" ") ||
    rack.part_number ||
    rack.name
  );
}

function rackKey(rack: Rack): string {
  const identity = [rack.manufacturer, rack.model, rack.part_number]
    .filter(Boolean)
    .join("|");
  return identity === "" ? `rack:${rack.id}` : `rack:${identity}`;
}

function deviceKey(kind: BomLineKind, slug: string): string {
  return `${kind}:${slug}`;
}

interface AddLineInput {
  key: string;
  kind: BomLineKind;
  name: string;
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  upc?: string;
  offers?: VendorOffer[];
  quantity: number;
  requiredBy?: string;
}

function addLine(lines: Map<string, BomLine>, input: AddLineInput): void {
  const existing = lines.get(input.key);
  if (existing) {
    existing.quantity += input.quantity;
    if (input.requiredBy && !existing.requiredBy.includes(input.requiredBy)) {
      existing.requiredBy.push(input.requiredBy);
    }
    return;
  }

  const offer = selectPreferredOffer(input.offers);
  const status = lineStatus(offer);
  const unitPrice = status === "ready" && offer ? offer.price : null;
  lines.set(input.key, {
    key: input.key,
    kind: input.kind,
    name: input.name,
    manufacturer: input.manufacturer,
    model: input.model,
    partNumber: input.partNumber,
    upc: input.upc,
    quantity: input.quantity,
    offer,
    status,
    unitPrice,
    extendedPrice: unitPrice === null ? null : unitPrice * input.quantity,
    requiredBy: input.requiredBy ? [input.requiredBy] : [],
  });
}

function addDeviceAndAccessories(
  lines: Map<string, BomLine>,
  type: DeviceType | undefined,
  slug: string,
  quantity: number,
  kind: "device" | "accessory",
  requiredBy?: string,
  ancestry: ReadonlySet<string> = new Set(),
  layoutTypes: DeviceType[] = [],
): void {
  if (!type) {
    addLine(lines, {
      key: deviceKey("missing", slug),
      kind: "missing",
      name: `Missing catalog item: ${slug}`,
      quantity,
      requiredBy,
    });
    return;
  }

  addLine(lines, {
    key: deviceKey(kind, type.slug),
    kind,
    name: displayName(type),
    manufacturer: type.manufacturer,
    model: type.model,
    partNumber: type.part_number,
    upc: type.upc,
    offers: type.vendor_offers,
    quantity,
    requiredBy,
  });

  if (ancestry.has(type.slug)) return;
  const nextAncestry = new Set(ancestry).add(type.slug);
  for (const accessorySlug of type.required_accessories ?? []) {
    addDeviceAndAccessories(
      lines,
      findDeviceType(accessorySlug, layoutTypes),
      accessorySlug,
      quantity,
      "accessory",
      displayName(type),
      nextAncestry,
      layoutTypes,
    );
  }
}

/** Build a purchase-aware, honest BOM from the current layout. */
export function buildBillOfMaterials(layout: Layout): BillOfMaterials {
  const lines = new Map<string, BomLine>();

  for (const rack of layout.racks) {
    addLine(lines, {
      key: rackKey(rack),
      kind: "rack",
      name: rackDisplayName(rack),
      manufacturer: rack.manufacturer,
      model: rack.model,
      partNumber: rack.part_number,
      upc: rack.upc,
      offers: rack.vendor_offers,
      quantity: 1,
    });

    for (const placed of rack.devices) {
      addDeviceAndAccessories(
        lines,
        findDeviceType(placed.device_type, layout.device_types),
        placed.device_type,
        1,
        "device",
        undefined,
        new Set(),
        layout.device_types,
      );
    }
  }

  const resolvedLines = [...lines.values()]
    .map((line) => ({
      ...line,
      extendedPrice:
        line.unitPrice === null ? null : line.unitPrice * line.quantity,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const pricedSubtotal = resolvedLines.reduce(
    (sum, line) => sum + (line.extendedPrice ?? 0),
    0,
  );
  const incompleteLines = resolvedLines.filter(
    (line) => line.status !== "ready",
  );

  return {
    layoutName: layout.name,
    lines: resolvedLines,
    total: incompleteLines.length === 0 ? pricedSubtotal : null,
    pricedSubtotal,
    unpricedLineCount: resolvedLines.filter(
      (line) =>
        line.status === "unpriced" ||
        line.status === "unverified" ||
        line.status === "unlinked",
    ).length,
    unavailableLineCount: resolvedLines.filter(
      (line) => line.status === "unavailable",
    ).length,
  };
}

function csvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Serialize a BOM to a spreadsheet-friendly CSV without losing purchase links. */
export function billOfMaterialsToCsv(bom: BillOfMaterials): string {
  const rows = [
    [
      "Type",
      "Manufacturer",
      "Model",
      "Part Number",
      "UPC",
      "Quantity",
      "Distributor",
      "Distributor SKU",
      "Availability",
      "Unit Price (USD)",
      "Extended Price (USD)",
      "Product Link",
      "Status",
      "Required By",
    ],
    ...bom.lines.map((line) => [
      line.kind,
      line.manufacturer,
      line.model,
      line.partNumber,
      line.upc,
      line.quantity,
      line.offer?.vendor,
      line.offer?.vendor_sku,
      line.offer?.availability,
      line.unitPrice,
      line.extendedPrice,
      line.offer?.product_url,
      line.status,
      line.requiredBy.join("; "),
    ]),
  ];

  return rows.map((row) => row.map(csvValue).join(",")).join("\n") + "\n";
}
