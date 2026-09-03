import { describe, expect, it } from "vitest";
import { wattboxDevices } from "./wattbox";

describe("WattBox brand pack", () => {
  it("contains only the selected UPS and power-strip records", () => {
    // eslint-disable-next-line no-restricted-syntax -- The supplied WattBox import is a versioned 17-SKU contract.
    expect(wattboxDevices).toHaveLength(17);
    expect(wattboxDevices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ part_number: "WB-100-PS-6" }),
        expect.objectContaining({ part_number: "WB-UPS-1500-8" }),
      ]),
    );
  });

  it("retains purchase identifiers and provisional rack dimensions", () => {
    expect(
      wattboxDevices.find((device) => device.part_number === "WB-UPS-1500-8"),
    ).toMatchObject({
      manufacturer: "WattBox",
      upc: "842822034609",
      u_height: 2,
      category: "power",
      catalog_price_status: "pending",
      rack_widths: [19],
    });
    expect(
      wattboxDevices.find((device) => device.part_number === "WB-100-VPS-12"),
    ).toMatchObject({ u_height: 1, category: "power" });
  });
});
