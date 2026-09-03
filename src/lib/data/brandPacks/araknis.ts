/**
 * Araknis Networks Brand Pack
 *
 * Derived from the distributor catalog supplied for RackWise AV. The source
 * export identifies SKU and UPC but not physical rack dimensions, so routers
 * and switches intentionally use a provisional 1U, 19-inch rack profile until
 * each product's dimensions can be verified from Snap One or ADI.
 */

import type { DeviceType } from "$lib/types";
import { CATEGORY_COLOURS } from "$lib/types/constants";
import { commercialCatalogItems } from "$lib/data/commercialCatalog";

const ARAKNIS_RACK_NETWORK_SKU = /^AN-\d+-(?:RT|SW)-/;

/**
 * Network appliances that can be placed in a media rack. Access points,
 * injectors, optics, power supplies and mounting accessories remain catalog
 * records, but are not represented as rack units until their placement model
 * is defined.
 */
export const araknisDevices: DeviceType[] = commercialCatalogItems
  .filter(
    (item) =>
      item.manufacturer === "Araknis Networks" &&
      ARAKNIS_RACK_NETWORK_SKU.test(item.sku),
  )
  .map((item) => ({
    slug: item.sku.toLowerCase(),
    u_height: 1,
    manufacturer: item.manufacturer,
    model: item.sku,
    part_number: item.sku,
    upc: item.upc,
    catalog_price_status: item.price_status,
    vendor_offers: [],
    category: "network",
    colour: CATEGORY_COLOURS.network,
    is_full_depth: false,
    rack_widths: [19],
    notes: `${item.description}. Rack height is provisional pending verification.`,
  }));
