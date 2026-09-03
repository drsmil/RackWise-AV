import { describe, expect, it } from "vitest";
import { araknisDevices } from "./araknis";

describe("Araknis network brand pack", () => {
  it("includes imported routers and switches with commercial identifiers", () => {
    const router = araknisDevices.find(
      (device) => device.part_number === "AN-110-RT-2L1W",
    );
    const switchDevice = araknisDevices.find(
      (device) => device.part_number === "AN-920-SW-F-24-POE",
    );

    expect(router).toMatchObject({
      manufacturer: "Araknis Networks",
      upc: "842822037594",
      u_height: 1,
      category: "network",
      catalog_price_status: "pending",
      rack_widths: [19],
    });
    expect(switchDevice).toMatchObject({
      manufacturer: "Araknis Networks",
      u_height: 1,
      category: "network",
    });
  });

  it("does not turn access points or accessories into rack devices", () => {
    expect(
      araknisDevices.some((device) => device.part_number === "AN-830-AP-I"),
    ).toBe(false);
    expect(
      araknisDevices.some(
        (device) => device.part_number === "AN-ACC-INJ-POE-30W",
      ),
    ).toBe(false);
  });
});
