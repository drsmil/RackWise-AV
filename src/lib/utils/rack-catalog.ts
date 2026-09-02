import type { Rack } from "$lib/types";
import type { CommercialRackCatalogItem } from "$lib/data/commercialCatalog";

/**
 * Convert a verified catalog record into the persisted metadata RackWise uses
 * for dimensions and the bill of materials. Pricing remains pending until a
 * distributor offer is verified.
 */
export function rackCatalogMetadata(
  item: CommercialRackCatalogItem,
): Partial<Rack> {
  if (item.rack_height_u === null) {
    throw new Error(`Rack ${item.sku} needs a confirmed U-height before use`);
  }

  return {
    name: item.description,
    manufacturer: item.manufacturer,
    model: item.description.replace(`${item.manufacturer} `, ""),
    part_number: item.sku,
    upc: item.upc,
    catalog_price_status: item.price_status,
    height: item.rack_height_u,
    width: 19,
    depth_mm:
      item.rack_depth_in === null ? undefined : item.rack_depth_in * 25.4,
    form_factor: item.form_factor,
    vendor_offers: [],
  };
}
