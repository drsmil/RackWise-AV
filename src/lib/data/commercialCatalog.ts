/**
 * Commercial catalog imported from distributor product exports supplied for
 * RackWise AV. Prices and product URLs intentionally remain pending until a
 * verified Snap One or ADI source is available.
 */

import type { FormFactor } from "$lib/types";

export type CommercialCatalogKind = "rack" | "rack-accessory" | "device";
export type CatalogPriceStatus = "pending" | "verified";

export interface CommercialCatalogItem {
  sku: string;
  upc: string;
  description: string;
  manufacturer: "Araknis Networks" | "Legion" | "Strong";
  kind: CommercialCatalogKind;
  /** No price is published until a distributor record is verified. */
  price: number | null;
  price_status: CatalogPriceStatus;
  /** Direct distributor page is captured later; no generic links are invented. */
  product_url: string | null;
  source_file: string;
  rack_height_u?: number | null;
  rack_depth_in?: number | null;
  form_factor?: FormFactor | null;
}

export type CommercialRackCatalogItem = CommercialCatalogItem & {
  kind: "rack";
  rack_height_u: number | null;
  rack_depth_in: number | null;
  form_factor: FormFactor;
};

import { importedRecordsPart1 } from "./commercialCatalog.part1";
import { importedRecordsPart2 } from "./commercialCatalog.part2";
import { importedRecordsPart3 } from "./commercialCatalog.part3";
import { importedRecordsPart4 } from "./commercialCatalog.part4";

const importedRecords = [
  ...importedRecordsPart1,
  ...importedRecordsPart2,
  ...importedRecordsPart3,
  ...importedRecordsPart4,
] as const;

export const commercialCatalogItems: CommercialCatalogItem[] =
  importedRecords.map((item) => ({
    ...item,
    price: null,
    price_status: "pending",
    product_url: null,
  }));

export const rackCatalogItems: CommercialRackCatalogItem[] =
  commercialCatalogItems.filter(
    (item): item is CommercialRackCatalogItem => item.kind === "rack",
  );

/** Racks that have an unambiguous U-height and can be selected as a preset. */
export const rackPresetCatalogItems = rackCatalogItems.filter(
  (item) => item.rack_height_u !== null,
);

export function findCommercialCatalogItem(
  sku: string,
): CommercialCatalogItem | undefined {
  return commercialCatalogItems.find((item) => item.sku === sku);
}
