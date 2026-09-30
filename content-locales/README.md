# Official universe content locales

These dictionaries have complete official source coverage and are authored translations of official MasterHost content, not native-reviewed editions. Required target languages are Russian (`ru`), Spanish (`es`), Japanese (`ja`), Simplified Chinese (`zh-CN`) and Korean (`ko`). English is the unchanged canonical source.

Each `<universe>/<locale>.json` maps the exact source display text to its translation. `_ui` holds shared display labels, genre/tone/difficulty names and event captions. Exact source keys intentionally include retained official library variants so existing immutable Worlds can render in the chosen language. Asset paths, IDs, option values, rules, formulas, licenses and user-created text are not rewritten.

The browser calls the resolver only at authored display sites. Pack-owned `universe.localization.strings` takes precedence over bundled translations. Custom names, player biographies and GM notes stay verbatim. Runtime source flags distinguish generated labels from custom values; projections do not update stored Worlds.

Run `node scripts/content-localization-inventory.mjs` to extract required official strings and `vitest run tests/content-localization-coverage.test.ts` to enforce complete target coverage. Native editorial and actual friends-game M30 acceptance remain separate gates.

Translations of official narrative content follow the original content license (CC BY 4.0, MasterHost contributors); shared UI strings follow the application PolyForm Noncommercial 1.0.0 license. Authoring helpers are reconstruction tools for exact repeated source structures, not runtime dependencies.

Authoring helpers use the committed ordered snapshots in `sources/`; they do not require temporary paths. They expand repeated names and captions from explicitly authored clauses. The standalone locale JSON files are the runtime inputs. After reconstructing a helper corpus, run `node scripts/sync-manifest-locales.mjs` and `node scripts/sync-artset-locales.mjs`, then the full coverage test, to restore the additional manifest and Art Set captions. Native editorial approval is not implied by coverage.
