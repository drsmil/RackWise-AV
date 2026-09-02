/** Canonical RackWise AV smart-rack mark. */
export const LOGO_VIEWBOX = "0 0 64 80";

/**
 * Square canvas variant: the mark full-bleed vertically, centred
 * horizontally with 12-unit side margins from the 0.7 aspect ratio.
 * Use for favicons, icon rasters, and any square context.
 */
export const LOGO_SQUARE_VIEWBOX = "-8 0 80 80";

/** Rounded 19-inch rack cabinet silhouette. */
export const LOGO_OUTLINE =
  "M6 0H58Q64 0 64 6V74Q64 80 58 80H6Q0 80 0 74V6Q0 0 6 0Z";

interface LogoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Four equal equipment bays, centred in the rack. */
export const LOGO_SLOTS: readonly LogoSlot[] = [
  { x: 7, y: 7, width: 50, height: 12 },
  { x: 7, y: 25, width: 50, height: 12 },
  { x: 7, y: 43, width: 50, height: 12 },
  { x: 7, y: 61, width: 50, height: 12 },
];

export const LOGO_SLOT_RADIUS = 2;

/**
 * Builds a rounded-rectangle SVG subpath for a single device slot.
 *
 * The generated path uses `M`/`h`/`q`/`v` commands and closes with `Z`.
 * These slot subpaths are appended to `LOGO_OUTLINE` in `LOGO_PATH` and
 * rendered with `fill-rule="evenodd"` so the slots appear as punched-out holes.
 */
function slotSubpath({ x, y, width, height }: LogoSlot): string {
  const r = LOGO_SLOT_RADIUS;
  const w = width - 2 * r;
  const h = height - 2 * r;
  return (
    `M${x + r} ${y}h${w}q${r} 0 ${r} ${r}v${h}q0 ${r} -${r} ${r}` +
    `h-${w}q-${r} 0 -${r} -${r}v-${h}q0 -${r} ${r} -${r}Z`
  );
}

/**
 * Complete mark with the slots punched out as holes.
 * Render with fill-rule="evenodd" so the slots show the background through.
 */
export const LOGO_PATH = [LOGO_OUTLINE, ...LOGO_SLOTS.map(slotSubpath)].join(
  "",
);
