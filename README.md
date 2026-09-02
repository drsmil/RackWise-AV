# RackWise AV

Design it. Validate it. Build it.

RackWise AV is a dimension-aware media-rack configurator for AV customers, sales teams, warehouse teams, and installers. It combines a visual rack layout workspace with compatibility checks and a future bill of materials containing prices, SKUs, and distributor links.

The project currently uses the proven Rackula layout engine as its foundation. RackWise AV is being developed as a separate product focused on professional AV equipment and the product ecosystems sold through Snap One and ADI.

## Current capabilities

- Drag-and-drop front and rear rack layouts
- Whole-U rail placement with carrier support for smaller devices
- Rack-width and placement compatibility checks
- Multiple racks and bayed AV rack groups
- Device images, labels, ports, cable connections, and annotations
- Undo and redo
- Browser-local projects and optional API persistence
- PNG, PDF, SVG, YAML, ZIP, URL, and QR sharing workflows
- Typed AV connectors including HDMI, SDI, XLR, Dante, AVB, and RS-232
- Commercial catalog metadata for dimensions, power, heat, accessories, distributor offers, pricing, availability, and purchase links

## Product direction

The RackWise AV catalog will prioritize:

- Strong media racks
- Legion media racks
- Middle Atlantic media racks
- Rack shelves, panels, power distribution, cooling, and cable management
- Network, surveillance, control, audio, and video equipment
- Snap One Partner Store and ADI Global Distribution product references

Unverified prices and product-page links must not be committed as real catalog data. Demo records must be clearly identified until their source is verified.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
npm run lint
npm run test:run
npm run build
```

## Compatibility strategy

RackWise AV keeps the existing Rackula storage keys and layout file format during the initial transition. This allows established layouts to continue loading while the commercial AV data model is added incrementally.

## License and attribution

RackWise AV is based on Rackula, created by Gareth Evans and contributors. The original project is available at [RackulaLives/Rackula](https://github.com/RackulaLives/Rackula).

The Rackula foundation is distributed under the MIT License. The original copyright notice and license are preserved in [LICENSE](LICENSE). Third-party credits are preserved in [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md).
