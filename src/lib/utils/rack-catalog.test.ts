import { describe, expect, it } from "vitest";
import { findCommercialCatalogItem } from "$lib/data/commercialCatalog";
import { rackCatalogMetadata } from "./rack-catalog";

describe("rackCatalogMetadata", () => {
  it("preserves imported Legion identity while leaving price data pending", () => {
    const legion = findCommercialCatalogItem("LR-42U");
    if (!legion || legion.kind !== "rack")
      throw new Error("Missing Legion rack");

    expect(rackCatalogMetadata(legion)).toMatchObject({
      manufacturer: "Legion",
      part_number: "LR-42U",
      upc: "842822041928",
      height: 42,
      catalog_price_status: "pending",
      vendor_offers: [],
    });
  });

  it("uses explicit dimensions only when the source description provides them", () => {
    const strong = findCommercialCatalogItem("SR-FS-SYSTEM-DC-42U");
    if (!strong || strong.kind !== "rack")
      throw new Error("Missing Strong rack");

    expect(rackCatalogMetadata(strong).depth_mm).toBeCloseTo(609.6);
  });
});
