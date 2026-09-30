# Licensing

- MasterHost-authored source code, scripts, application UI strings and documentation are offered under the PolyForm Noncommercial License 1.0.0 in [`LICENSE`](../LICENSE). Noncommercial use is permitted; commercial use requires a separate grant from the rights holder. This source-available license is not an OSI-approved open-source license.
- Bundled official World Pack text, original artwork, narrative translations and packaged game assets retain their own `CC-BY-4.0` terms and attribution in Pack manifests and asset records. The code license does not replace those terms.
- Game assets declare license, source, attribution and immutable checksum in the asset registry.
- External dependencies retain their respective licenses; `node scripts/build-release.mjs VERSION` writes their installed license inventory to `THIRD_PARTY_LICENSES.json` in every release archive. This inventory is independent of the MasterHost code license.

The current dependency set uses MIT, ISC, Apache-2.0, BSD-3-Clause, 0BSD, CC-BY-4.0 and Unlicense. Inventory is release evidence, not a substitute for legal review of external contributions. Previous private/local revisions carried MIT notices; publishing a new snapshot under PolyForm does not revoke grants already made to recipients of those earlier revisions.
