import { describe, expect, it } from "vitest";
import type { DeviceType, Layout, Rack } from "$lib/types";
import {
  billOfMaterialsToCsv,
  buildBillOfMaterials,
  selectPreferredOffer,
} from "$lib/utils/bom";

const verifiedSnapOffer = {
  vendor: "snap-one" as const,
  vendor_sku: "SNAP-1",
  price: 125,
  currency: "USD" as const,
  product_url: "https://www.snaponepartnerstore.com/demo",
  availability: "in-stock" as const,
  last_verified_at: "2026-09-02T12:00:00.000Z",
};

function device(overrides: Partial<DeviceType> = {}): DeviceType {
  return {
    slug: "processor",
    u_height: 1,
    colour: "#111111",
    category: "av-media",
    ...overrides,
  };
}

function rack(overrides: Partial<Rack> = {}): Rack {
  return {
    id: "rack-1",
    name: "Media Rack",
    height: 24,
    width: 19,
    desc_units: false,
    show_rear: true,
    form_factor: "4-post-cabinet",
    starting_unit: 1,
    position: 0,
    devices: [],
    ...overrides,
  };
}

function layout(overrides: Partial<Layout> = {}): Layout {
  return {
    version: "1.0.0",
    name: "Customer media room",
    racks: [],
    device_types: [],
    settings: { display_mode: "label", show_labels_on_images: false },
    ...overrides,
  };
}

describe("selectPreferredOffer", () => {
  it("prefers a verified in-stock distributor offer over an unverified lower price", () => {
    expect(
      selectPreferredOffer([
        {
          ...verifiedSnapOffer,
          price: 200,
          vendor: "adi",
          product_url: "https://adi.example/product",
        },
        { ...verifiedSnapOffer, price: 1, last_verified_at: null },
      ]),
    ).toMatchObject({ vendor: "adi", price: 200 });
  });
});

describe("buildBillOfMaterials", () => {
  it("groups devices, includes racks and required accessories, and totals verified pricing", () => {
    const processor = device({
      manufacturer: "Strong",
      model: "AV Processor",
      part_number: "STR-AVP",
      vendor_offers: [verifiedSnapOffer],
      required_accessories: ["power-strip"],
    });
    const powerStrip = device({
      slug: "power-strip",
      manufacturer: "Middle Atlantic",
      model: "Power Strip",
      part_number: "MA-PS",
      vendor_offers: [{ ...verifiedSnapOffer, price: 40, vendor_sku: "PS-1" }],
    });
    const result = buildBillOfMaterials(
      layout({
        racks: [
          rack({
            manufacturer: "Legion",
            model: "24U Media Rack",
            part_number: "LEG-24",
            vendor_offers: [
              { ...verifiedSnapOffer, price: 400, vendor_sku: "LEG-24" },
            ],
            devices: [
              {
                id: "one",
                device_type: "processor",
                position: 1,
                face: "front",
              },
              {
                id: "two",
                device_type: "processor",
                position: 7,
                face: "front",
              },
            ],
          }),
        ],
        device_types: [processor, powerStrip],
      }),
    );

    expect(result.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "rack",
          quantity: 1,
          extendedPrice: 400,
        }),
        expect.objectContaining({
          kind: "device",
          name: "Strong AV Processor",
          quantity: 2,
          extendedPrice: 250,
        }),
        expect.objectContaining({
          kind: "accessory",
          quantity: 2,
          extendedPrice: 80,
          requiredBy: ["Strong AV Processor"],
        }),
      ]),
    );
    expect(result.total).toBe(730);
  });

  it("does not claim a total when an item is missing, unverified, or unpriced", () => {
    const result = buildBillOfMaterials(
      layout({
        racks: [
          rack({
            devices: [
              { id: "one", device_type: "missing", position: 1, face: "front" },
            ],
          }),
        ],
        device_types: [
          device({ vendor_offers: [{ ...verifiedSnapOffer, price: null }] }),
        ],
      }),
    );

    expect(result.total).toBeNull();
    expect(result.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "rack", status: "unlinked" }),
        expect.objectContaining({ kind: "missing", status: "unlinked" }),
      ]),
    );
  });

  it("keeps purchase links and quoted comma-containing names valid in CSV", () => {
    const bom = buildBillOfMaterials(
      layout({
        racks: [
          rack({
            devices: [
              {
                id: "one",
                device_type: "processor",
                position: 1,
                face: "front",
              },
            ],
          }),
        ],
        device_types: [
          device({
            manufacturer: "Strong, Inc.",
            vendor_offers: [verifiedSnapOffer],
          }),
        ],
      }),
    );

    expect(billOfMaterialsToCsv(bom)).toContain(
      'device,"Strong, Inc.",,,,1,snap-one,SNAP-1,in-stock,125,125,https://www.snaponepartnerstore.com/demo,ready,',
    );
  });
});
