<!--
  LogoLockup Component
  Logo + title lockup for RackWise AV branding
  Brand text: White by default, rainbow gradient on hover
  Celebrate on success, Showcase mode: slow rainbow wave for About/Help

-->
<script lang="ts">
  import SantaHat from "./SantaHat.svelte";
  import { isChristmas } from "$lib/utils/christmas";
  import {
    LOGO_PATH,
    LOGO_SQUARE_VIEWBOX,
  } from "$lib/components/logo-geometry";

  interface Props {
    size?: number;
    celebrate?: boolean;
    partyMode?: boolean;
    showcase?: boolean;
    showText?: boolean;
  }

  let {
    size = 36,
    celebrate = false,
    partyMode = false,
    showcase = false,
    showText = true,
  }: Props = $props();

  // Christmas easter egg - only show on December 25
  const showChristmasHat = isChristmas();

  // Hover state for rainbow animation
  let hovering = $state(false);

  // Calculate proportional title height (logo should be slightly taller)
  const titleHeight = $derived(size * 1.2);

  type ActiveGradientKind = "rainbow" | "celebrate" | "party" | "showcase";
  type GradientIds = Record<ActiveGradientKind, string>;

  function createGradientIds(prefix: string): GradientIds {
    return {
      rainbow: `${prefix}-rainbow`,
      celebrate: `${prefix}-celebrate`,
      party: `${prefix}-party`,
      showcase: `${prefix}-showcase`,
    };
  }

  // Unique IDs per LogoLockup instance avoid collisions across Toolbar/Help.
  const gradientIdSuffix = Math.random().toString(36).slice(2, 9);
  const markGradientIds = createGradientIds(`lockup-mark-${gradientIdSuffix}`);
  const titleGradientIds = createGradientIds(
    `lockup-title-${gradientIdSuffix}`,
  );

  // Determine active gradient based on state (priority order).
  const activeGradient = $derived<ActiveGradientKind | null>(
    partyMode
      ? "party"
      : celebrate
        ? "celebrate"
        : showcase
          ? "showcase"
          : hovering
            ? "rainbow"
            : null,
  );

  const markGradientUrl = $derived(
    activeGradient ? `url(#${markGradientIds[activeGradient]})` : undefined,
  );
  const titleGradientUrl = $derived(
    activeGradient ? `url(#${titleGradientIds[activeGradient]})` : undefined,
  );
</script>

{#snippet activeGradientDef(kind: ActiveGradientKind, id: string)}
  <defs>
    {#if kind === "rainbow"}
      <!-- Animated rainbow gradient for hover (Dracula colors, 6s cycle) -->
      <linearGradient {id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%">
          <animate
            attributeName="stop-color"
            values="#BD93F9;#FF79C6;#8BE9FD;#50FA7B;#BD93F9"
            dur="6s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="50%">
          <animate
            attributeName="stop-color"
            values="#FF79C6;#8BE9FD;#50FA7B;#BD93F9;#FF79C6"
            dur="6s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%">
          <animate
            attributeName="stop-color"
            values="#8BE9FD;#50FA7B;#BD93F9;#FF79C6;#8BE9FD"
            dur="6s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
    {:else if kind === "celebrate"}
      <!-- Celebrate gradient (3s one-shot rainbow wave) -->
      <linearGradient {id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%">
          <animate
            attributeName="stop-color"
            values="#BD93F9;#FF79C6;#8BE9FD;#50FA7B;#BD93F9"
            dur="3s"
            repeatCount="1"
            fill="freeze"
          />
        </stop>
        <stop offset="50%">
          <animate
            attributeName="stop-color"
            values="#FF79C6;#8BE9FD;#50FA7B;#BD93F9;#FF79C6"
            dur="3s"
            repeatCount="1"
            fill="freeze"
          />
        </stop>
        <stop offset="100%">
          <animate
            attributeName="stop-color"
            values="#8BE9FD;#50FA7B;#BD93F9;#FF79C6;#8BE9FD"
            dur="3s"
            repeatCount="1"
            fill="freeze"
          />
        </stop>
      </linearGradient>
    {:else if kind === "party"}
      <!-- Party mode gradient (fast 0.5s rainbow cycle) -->
      <linearGradient {id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%">
          <animate
            attributeName="stop-color"
            values="#BD93F9;#FF79C6;#8BE9FD;#50FA7B;#FFB86C;#FF5555;#F1FA8C;#BD93F9"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="50%">
          <animate
            attributeName="stop-color"
            values="#8BE9FD;#50FA7B;#FFB86C;#FF5555;#F1FA8C;#BD93F9;#FF79C6;#8BE9FD"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%">
          <animate
            attributeName="stop-color"
            values="#50FA7B;#FFB86C;#FF5555;#F1FA8C;#BD93F9;#FF79C6;#8BE9FD;#50FA7B"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
    {:else}
      <!-- Showcase gradient: static fallback to avoid Firefox image decode errors on initial load -->
      <linearGradient {id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#BD93F9" />
        <stop offset="50%" stop-color="#8BE9FD" />
        <stop offset="100%" stop-color="#50FA7B" />
      </linearGradient>
    {/if}
  </defs>
{/snippet}

<div
  class="logo-lockup"
  onmouseenter={() => (hovering = true)}
  onmouseleave={() => (hovering = false)}
  role="presentation"
>
  <!-- Smart-rack logo mark + optional Christmas hat -->
  <div class="logo-mark-container">
    <svg
      class="logo-mark"
      class:logo-mark--celebrate={celebrate}
      class:logo-mark--party={partyMode}
      class:logo-mark--showcase={showcase}
      class:logo-mark--hover={hovering && !partyMode && !celebrate && !showcase}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOGO_SQUARE_VIEWBOX}
      width={size}
      height={size}
      aria-hidden="true"
      fill-rule="evenodd"
    >
      {#if activeGradient}
        {@render activeGradientDef(
          activeGradient,
          markGradientIds[activeGradient],
        )}
      {/if}
      <!-- Coffin-tapered frame with device slots as negative space -->
      <path d={LOGO_PATH} fill={markGradientUrl} />
    </svg>
    {#if showChristmasHat}
      <div class="logo-hat">
        <SantaHat size={size * 0.45} />
      </div>
    {/if}
  </div>

  <!-- Title (SVG text for gradient support) - Space Grotesk -->
  {#if showText}
    <svg
      class="logo-title"
      class:logo-title--celebrate={celebrate}
      class:logo-title--party={partyMode}
      class:logo-title--showcase={showcase}
      class:logo-title--hover={hovering &&
        !partyMode &&
        !celebrate &&
        !showcase}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 245 50"
      height={titleHeight}
      role="img"
      aria-label="RackWise AV"
    >
      {#if activeGradient}
        {@render activeGradientDef(
          activeGradient,
          titleGradientIds[activeGradient],
        )}
      {/if}
      <text x="0" y="38" fill={titleGradientUrl}>RackWise AV</text>
    </svg>
  {/if}
</div>

<style>
  .logo-lockup {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .logo-mark-container {
    position: relative;
    flex-shrink: 0;
  }

  .logo-hat {
    position: absolute;
    top: -13px;
    right: 0px;
    z-index: 1;
  }

  .logo-mark {
    fill: var(--rackwise-accent, #38bdf8);
    transition: fill 0.3s ease;
    flex-shrink: 0;
    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.25));
    /* Align mark baseline with text baseline */
    margin-bottom: -2px;
  }

  .logo-title text {
    fill: var(--colour-text, #edf7ff);
    transition: fill 0.3s ease;
  }

  .logo-title {
    width: auto;
    filter: drop-shadow(0 0 6px rgba(248, 248, 242, 0.15));
  }

  .logo-title text {
    /* Space Grotesk for wordmark */
    font-family: "Space Grotesk", var(--font-family, system-ui, sans-serif);
    font-size: 38px;
    font-weight: 500;
  }

  /* Celebrate state: rainbow wave for 3s */
  .logo-mark--celebrate,
  .logo-title--celebrate {
    filter: drop-shadow(0 0 20px rgba(189, 147, 249, 0.4));
  }

  /* Party mode: fast rainbow + wobble */
  .logo-mark--party,
  .logo-title--party {
    filter: drop-shadow(0 0 24px rgba(189, 147, 249, 0.5));
    animation: wobble var(--anim-party, 0.5s) ease-in-out infinite;
  }

  /* Showcase mode: slow rainbow wave for About/Help */
  .logo-mark--showcase,
  .logo-title--showcase {
    filter: drop-shadow(0 0 16px rgba(189, 147, 249, 0.4));
  }

  /* Hover state: 6s rainbow cycle */
  .logo-mark--hover,
  .logo-title--hover {
    filter: drop-shadow(0 0 12px rgba(189, 147, 249, 0.4));
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .logo-mark {
      fill: var(--rackwise-accent, #38bdf8);
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.25));
    }

    .logo-title text {
      fill: var(--colour-text, #edf7ff);
    }

    .logo-title {
      filter: drop-shadow(0 0 6px rgba(248, 248, 242, 0.15));
    }

    /* Static purple for hover state (no animation) - logo stays purple, text goes purple */
    .logo-mark--hover path {
      fill: var(--dracula-purple) !important;
      filter: drop-shadow(0 0 8px rgba(189, 147, 249, 0.3));
    }

    .logo-title--hover text {
      fill: var(--dracula-purple) !important;
    }

    .logo-title--hover {
      filter: drop-shadow(0 0 8px rgba(189, 147, 249, 0.2));
    }

    /* Static purple for special states (no animation) */
    .logo-mark--celebrate path,
    .logo-mark--party path,
    .logo-mark--showcase path,
    .logo-title--celebrate text,
    .logo-title--party text,
    .logo-title--showcase text {
      fill: var(--dracula-purple) !important;
    }

    .logo-mark--party,
    .logo-title--party {
      animation: none;
    }
  }

  /* Responsive: hide title on small screens (but not in toolbar hamburger mode) */
  @media (max-width: 600px) {
    .logo-title {
      display: none;
    }
  }

  /* Wobble keyframe for party mode */
  @keyframes wobble {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-3deg);
    }
    75% {
      transform: rotate(3deg);
    }
  }
</style>
