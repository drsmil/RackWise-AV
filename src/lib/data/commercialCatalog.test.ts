import { describe, expect, it } from "vitest";
import {
  commercialCatalogItems,
  rackCatalogItems,
  rackPresetCatalogItems,
} from "./commercialCatalog";

describe("commercial catalog imports", () => {
  it("retains every SKU supplied by the initial distributor exports", () => {
    // The supplied spreadsheet exports are a versioned import contract.
    // eslint-disable-next-line no-restricted-syntax -- Detect accidental loss during import regeneration.
    expect(commercialCatalogItems).toHaveLength(421);
    expect(new Set(commercialCatalogItems.map((item) => item.sku)).size).toBe(
      421,
    );
    expect(commercialCatalogItems.every((item) => item.price === null)).toBe(
      true,
    );
    expect(
      commercialCatalogItems.every((item) => item.price_status === "pending"),
    ).toBe(true);
  });

  it("imports the selected WattBox UPS and power-strip catalog records", () => {
    const wattbox = commercialCatalogItems.filter(
      (item) => item.manufacturer === "WattBox",
    );

    // eslint-disable-next-line no-restricted-syntax -- The supplied WattBox import is a versioned 17-SKU contract.
    expect(wattbox).toHaveLength(17);
    expect(wattbox.find((item) => item.sku === "WB-UPS-1500-8")).toMatchObject({
      upc: "842822034609",
      price: null,
      price_status: "pending",
      product_url: null,
    });
  });

  it("identifies the Legion rack range with its source SKU and UPC", () => {
    const legion = rackPresetCatalogItems.filter(
      (item) => item.manufacturer === "Legion",
    );

    expect(legion.map((item) => item.sku)).toEqual([
      "LR-18U",
      "LR-27U",
      "LR-35U",
      "LR-42U",
    ]);
    expect(legion.find((item) => item.sku === "LR-42U")?.upc).toBe(
      "842822041928",
    );
  });

  it("keeps Strong rack systems distinct from their accessories", () => {
    expect(
      rackCatalogItems.some((item) => item.sku === "SR-FS-SYSTEM-DC-42U"),
    ).toBe(true);
    expect(rackCatalogItems.some((item) => item.sku === "SR-SHELF-2U")).toBe(
      false,
    );
    expect(
      commercialCatalogItems.some((item) => item.sku === "SR-SHELF-2U"),
    ).toBe(true);
  });
});
