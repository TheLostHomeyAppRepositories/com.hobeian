# Next release preparation

Homey approved version 1.0.9 and requested these App Store improvements. Prepare them for the next planned update; do not create a release for this feedback alone.

- [x] Rewrite README.txt to introduce the app, supported devices, pairing, and Homey Flow uses.
- [x] Make README.md user-facing and move implementation details and hardware testing status to DEVELOPMENT.md.
- [x] Maintain release history in a dedicated Keep a Changelog-style CHANGELOG.md.
- [x] Replace the ZG-222Z and ZG-227Z driver images with model-specific product photos on transparent backgrounds.

## Device photo preparation

Obtain an owner-provided or appropriately licensed manufacturer photo of each exact model. Verify model identity and permission to use it. Do not substitute another sensor or an AI-generated approximation.

Replace both small.png and large.png under each driver's assets/images directory. Keep Homey's required dimensions (75 × 75 and 500 × 500 pixels), transparent PNG backgrounds, and a clear, centered device with consistent padding. Confirm the driver image paths still resolve, inspect both sizes visually, and run Homey app validation before the next release.

Both driver image sizes now use the model-specific Zigbee2MQTT source photos.

Reference: https://apps.developer.homey.app/app-store/guidelines

## Located photo sources (2026-10-21)

- ZG-222Z: https://www.zigbee2mqtt.io/images/devices/ZG-222Z.png — linked from https://www.zigbee2mqtt.io/devices/ZG-222Z.html
- ZG-227Z: https://www.zigbee2mqtt.io/images/devices/ZG-227Z.png — linked from https://www.zigbee2mqtt.io/devices/ZG-227Z.html
- Additional ZG-222Z product photo: https://images.prom.ua/6305504368_datchik-protikannya-vodi.jpg — listing identifies HOBEIAN ZG-222Z: https://tuya.in.ua/ua/p2860484945-datchik-protechki-vody.html

ZG-227Z has multiple physical variants. An owner reports a newer round model without a display, distinct from the rectangular model: https://github.com/Koenkk/zigbee2mqtt/issues/29430 . Check the selected photo against the supported hardware; do not substitute a ZG-227ZL LCD model.

Both source PNGs were retrieved through the GitHub connector from Koenkk/zigbee2mqtt.io, public/images/devices/. Both originals are 512 × 512 with transparency. The original photographed pixels were preserved: trim transparent margins, fit within 84% of the canvas, center, and export RGBA PNGs at 75 × 75 and 500 × 500. No generated cutout was used. Resolution and transparency were checked programmatically and images inspected visually. Source-site image reuse terms remain unconfirmed; no release has been made.
