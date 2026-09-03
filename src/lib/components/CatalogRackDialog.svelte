<script lang="ts">
  import Dialog from "$lib/components/Dialog.svelte";
  import {
    rackPresetCatalogItems,
    type CommercialRackCatalogItem,
  } from "$lib/data/commercialCatalog";
  import { rackCatalogMetadata } from "$lib/utils/rack-catalog";
  import { getLayoutStore } from "$lib/stores/layout.svelte";
  import { getSelectionStore } from "$lib/stores/selection.svelte";
  import { getToastStore } from "$lib/stores/toast.svelte";
  import { handleFitAll } from "$lib/utils/app-actions";

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  let { open = $bindable(), onclose }: Props = $props();

  const layoutStore = getLayoutStore();
  const selectionStore = getSelectionStore();
  const toastStore = getToastStore();

  let search = $state("");
  let manufacturer = $state<"all" | "Legion" | "Strong">("all");
  let selectedSku = $state(rackPresetCatalogItems[0]?.sku ?? "");

  const filteredRacks = $derived(
    rackPresetCatalogItems.filter((item) => {
      const matchesManufacturer =
        manufacturer === "all" || item.manufacturer === manufacturer;
      const searchTerm = search.trim().toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        [item.sku, item.upc, item.description]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm);
      return matchesManufacturer && matchesSearch;
    }),
  );
  const selectedRack = $derived(
    filteredRacks.find((item) => item.sku === selectedSku) ?? filteredRacks[0],
  );

  function selectRack(item: CommercialRackCatalogItem) {
    selectedSku = item.sku;
  }

  function closeDialog() {
    open = false;
    onclose();
  }

  function createCatalogRack() {
    if (!selectedRack) return;
    const metadata = rackCatalogMetadata(selectedRack);
    const rack = layoutStore.addRack(
      metadata.name ?? selectedRack.description,
      metadata.height ?? selectedRack.rack_height_u ?? 24,
      metadata.width,
      metadata.form_factor,
      undefined,
      undefined,
      {
        getSelectedRackId: () => selectionStore.selectedRackId,
        setSelectedRackId: (id) => {
          if (id) selectionStore.selectRack(id);
          else selectionStore.clearSelection();
        },
      },
      metadata,
    );
    if (!rack) {
      toastStore.showToast("Maximum number of racks reached", "warning");
      return;
    }
    toastStore.showToast(`Added ${selectedRack.sku}`, "success");
    closeDialog();
    requestAnimationFrame(() => handleFitAll());
  }
</script>

<Dialog
  bind:open
  title="Add catalog rack"
  size="L"
  type="form"
  testid="catalog-rack-dialog"
  onclose={closeDialog}
>
  <div class="catalog-rack-dialog">
    <p class="intro">
      Select a Strong or Legion rack. SKU, UPC and known dimensions are saved
      with the layout; price and purchase link remain pending until verified.
    </p>

    <div class="filters">
      <input
        bind:value={search}
        placeholder="Search SKU, UPC, or description"
        aria-label="Search catalog racks"
      />
      <select bind:value={manufacturer} aria-label="Filter rack manufacturer">
        <option value="all">All manufacturers</option>
        <option value="Legion">Legion</option>
        <option value="Strong">Strong</option>
      </select>
    </div>

    <div class="catalog-content">
      <div class="rack-options" role="listbox" aria-label="Catalog racks">
        {#if filteredRacks.length === 0}
          <p class="empty">No catalog racks match this search.</p>
        {:else}
          {#each filteredRacks as item (item.sku)}
            <button
              type="button"
              class:active={selectedRack?.sku === item.sku}
              onclick={() => selectRack(item)}
              role="option"
              aria-selected={selectedRack?.sku === item.sku}
            >
              <strong>{item.sku}</strong>
              <span>{item.description}</span>
              <small>{item.manufacturer} · {item.rack_height_u}U</small>
            </button>
          {/each}
        {/if}
      </div>

      {#if selectedRack}
        <aside class="details" aria-live="polite">
          <p class="eyebrow">Selected rack</p>
          <h3>{selectedRack.description}</h3>
          <dl>
            <div>
              <dt>Manufacturer</dt>
              <dd>{selectedRack.manufacturer}</dd>
            </div>
            <div>
              <dt>SKU</dt>
              <dd>{selectedRack.sku}</dd>
            </div>
            <div>
              <dt>UPC</dt>
              <dd>{selectedRack.upc}</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>{selectedRack.rack_height_u}U</dd>
            </div>
            <div>
              <dt>Depth</dt>
              <dd>
                {selectedRack.rack_depth_in
                  ? `${selectedRack.rack_depth_in} in`
                  : "Pending confirmation"}
              </dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd class="pending">Pending verification</dd>
            </div>
          </dl>
        </aside>
      {/if}
    </div>

    <div class="actions">
      <button type="button" class="secondary" onclick={closeDialog}>
        Cancel
      </button>
      <button
        type="button"
        class="primary"
        disabled={!selectedRack}
        onclick={createCatalogRack}
      >
        Add selected rack
      </button>
    </div>
  </div>
</Dialog>

<style>
  .catalog-rack-dialog {
    display: grid;
    gap: 1rem;
  }
  .intro,
  .empty {
    margin: 0;
    color: var(--text-secondary, #a7b1c2);
  }
  .filters {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
  }
  input,
  select {
    min-height: 2.5rem;
    border: 1px solid var(--border-colour, #3b4658);
    border-radius: 0.5rem;
    background: var(--surface-colour, #17202c);
    color: inherit;
    padding: 0 0.75rem;
  }
  .catalog-content {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(12rem, 0.9fr);
    gap: 1rem;
    min-height: 19rem;
  }
  .rack-options {
    display: grid;
    align-content: start;
    gap: 0.4rem;
    max-height: 22rem;
    overflow: auto;
    padding-right: 0.25rem;
  }
  .rack-options button {
    display: grid;
    gap: 0.2rem;
    text-align: left;
    border: 1px solid var(--border-colour, #3b4658);
    border-radius: 0.5rem;
    background: transparent;
    color: inherit;
    padding: 0.7rem 0.8rem;
    cursor: pointer;
  }
  .rack-options button:hover,
  .rack-options button.active {
    border-color: var(--accent-colour, #5b9cff);
    background: color-mix(
      in srgb,
      var(--accent-colour, #5b9cff) 13%,
      transparent
    );
  }
  .rack-options span {
    font-size: 0.84rem;
    color: var(--text-secondary, #a7b1c2);
  }
  .rack-options small {
    color: var(--text-secondary, #a7b1c2);
  }
  .details {
    border: 1px solid var(--border-colour, #3b4658);
    border-radius: 0.6rem;
    padding: 1rem;
    background: var(--surface-colour, #17202c);
  }
  .eyebrow {
    margin: 0 0 0.4rem;
    color: var(--text-secondary, #a7b1c2);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }
  dl {
    display: grid;
    gap: 0.65rem;
    margin: 0;
  }
  dl div {
    display: grid;
    gap: 0.15rem;
  }
  dt {
    color: var(--text-secondary, #a7b1c2);
    font-size: 0.75rem;
  }
  dd {
    margin: 0;
    font-weight: 600;
    word-break: break-word;
  }
  .pending {
    color: #e9b44c;
  }
  .actions {
    display: flex;
    justify-content: end;
    gap: 0.75rem;
  }
  .actions button {
    min-height: 2.5rem;
    border-radius: 0.5rem;
    padding: 0 1rem;
    cursor: pointer;
  }
  .secondary {
    border: 1px solid var(--border-colour, #3b4658);
    background: transparent;
    color: inherit;
  }
  .primary {
    border: 0;
    background: var(--accent-colour, #5b9cff);
    color: #fff;
    font-weight: 700;
  }
  .primary:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  @media (max-width: 640px) {
    .filters,
    .catalog-content {
      grid-template-columns: 1fr;
    }
    .rack-options {
      max-height: 14rem;
    }
  }
</style>
