/**
 * WattBox Brand Pack
 *
 * UPS and power strips selected from the supplied commercial export. The
 * export does not provide rack dimensions, so placements are deliberately
 * provisional: UPS units are represented as 2U and strips as 1U until each
 * model is verified against the distributor listing.
 */

import type { DeviceType } from "$lib/types";
import { CATEGORY_COLOURS } from "$lib/types/constants";
import { commercialCatalogItems } from "$lib/data/commercialCatalog";

function provisionalHeight(sku: string): number {
  return sku.includes("UPS") ? 2 : 1;
}

export const wattboxDevices: DeviceType[] = commercialCatalogItems
  .filter((item) => item.manufacturer === "WattBox")
  .map((item) => {
    const uHeight = provisionalHeight(item.sku);
    return {
      slug: item.sku.toLowerCase(),
      u_height: uHeight,
      manufacturer: item.manufacturer,
      model: item.sku,
      part_number: item.sku,
      upc: item.upc,
      catalog_price_status: item.price_status,
      vendor_offers: [],
      category: "power",
      colour: CATEGORY_COLOURS.power,
      is_full_depth: false,
      rack_widths: [19],
      notes: `${item.description}. ${uHeight}U placement is provisional pending verification.`,
    };
  });
