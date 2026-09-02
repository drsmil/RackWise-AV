<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import Button from "./ui/Button.svelte";
  import type { Layout } from "$lib/types";
  import { billOfMaterialsToCsv, buildBillOfMaterials } from "$lib/utils/bom";
  import { downloadBlob } from "$lib/utils/export";
  import { getToastStore } from "$lib/stores/toast.svelte";

  interface Props {
    open: boolean;
    layout: Layout;
    onclose?: () => void;
  }

  let { open, layout, onclose }: Props = $props();
  const toastStore = getToastStore();
  const bom = $derived(buildBillOfMaterials(layout));
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function downloadCsv() {
    const filename = `${
      layout.name
        .trim()
        .replaceAll(/[^a-z0-9]+/gi, "-")
        .replaceAll(/^-|-$/g, "") || "rackwise-av"
    }-bom.csv`;
    downloadBlob(
      new Blob([billOfMaterialsToCsv(bom)], { type: "text/csv;charset=utf-8" }),
      filename,
    );
    toastStore.showToast("Bill of materials downloaded", "success");
  }
</script>

<Dialog {open} title="Bill of Materials" size="L" type="info" {onclose}>
  <div class="bom-dialog" data-testid="bill-of-materials-dialog">
    <p class="intro">
      {bom.lines.length} identified item{bom.lines.length === 1 ? "" : "s"} for {bom.layoutName}.
      Prices are only included in the total when their distributor listing was
      verified.
    </p>

    {#if bom.lines.length === 0}
      <div class="empty-state">
        Add a rack or device to generate a bill of materials.
      </div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Distributor</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each bom.lines as line (line.key)}
              <tr>
                <td>
                  <strong>{line.name}</strong>
                  {#if line.partNumber}<span class="part-number"
                      >{line.partNumber}</span
                    >{/if}
                  {#if line.requiredBy.length > 0}
                    <span class="required-by"
                      >Required by {line.requiredBy.join(", ")}</span
                    >
                  {/if}
                </td>
                <td>{line.quantity}</td>
                <td>
                  {#if line.offer}
                    <a
                      href={line.offer.product_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {line.offer.vendor === "snap-one"
                        ? "Snap One"
                        : line.offer.vendor.toUpperCase()}
                    </a>
                    <span class="availability"
                      >{line.offer.availability.replaceAll("-", " ")}</span
                    >
                  {:else}
                    <span class="muted">No listing</span>
                  {/if}
                </td>
                <td
                  >{line.extendedPrice === null
                    ? "-"
                    : formatter.format(line.extendedPrice)}</td
                >
                <td
                  ><span class="status {line.status}"
                    >{line.status.replaceAll("-", " ")}</span
                  ></td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="summary">
        {#if bom.total === null}
          <div>
            <strong>Quote incomplete</strong>
            <span
              >{bom.unpricedLineCount} item(s) need verified pricing or a purchase
              link.</span
            >
          </div>
          <strong>Known subtotal: {formatter.format(bom.pricedSubtotal)}</strong
          >
        {:else}
          <span>Total</span>
          <strong>{formatter.format(bom.total)}</strong>
        {/if}
      </div>
    {/if}

    <div class="actions">
      <Button variant="secondary" onclick={onclose}>Close</Button>
      <Button
        variant="primary"
        onclick={downloadCsv}
        disabled={bom.lines.length === 0}
      >
        Download CSV
      </Button>
    </div>
  </div>
</Dialog>

<style>
  .bom-dialog {
    display: grid;
    gap: var(--space-4);
  }
  .intro,
  .muted,
  .availability,
  .part-number,
  .required-by {
    color: var(--colour-text-muted);
  }
  .intro {
    margin: 0;
    line-height: 1.5;
  }
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }
  th,
  td {
    padding: var(--space-3);
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--colour-border);
  }
  th {
    color: var(--colour-text-muted);
    font-weight: var(--font-weight-semibold);
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  td strong,
  .part-number,
  .required-by,
  .availability {
    display: block;
  }
  .part-number,
  .required-by,
  .availability {
    margin-top: var(--space-1);
    font-size: var(--font-size-xs);
  }
  a {
    color: var(--colour-primary);
  }
  .status {
    text-transform: capitalize;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
  }
  .status.ready {
    color: var(--colour-success);
  }
  .status.unavailable {
    color: var(--colour-error);
  }
  .status.unpriced,
  .status.unverified,
  .status.unlinked {
    color: var(--colour-warning);
  }
  .summary {
    display: flex;
    justify-content: space-between;
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--colour-surface-raised);
  }
  .summary div {
    display: grid;
    gap: var(--space-1);
  }
  .summary span {
    color: var(--colour-text-muted);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }
  .empty-state {
    padding: var(--space-6);
    text-align: center;
    color: var(--colour-text-muted);
    border: 1px dashed var(--colour-border);
    border-radius: var(--radius-md);
  }
  @media (max-width: 640px) {
    .summary {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
