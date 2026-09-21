# M13 Advanced and Full Custom Builder Design

**Status:** approved product direction, implementation in progress

## Outcome

M13 turns the existing technical Pack editor and one-choice catalog into a real product authoring surface. A GM can either assemble visibly different games from a broad compatible menu or fork an assembled game into a fully editable Pack and change every supported structure through browser controls.

The milestone preserves the canonical pipeline:

`published assets -> exact game Descriptor -> composed Pack -> editable Pack fork -> compiler -> materialized World`

No runtime branch may depend on a bundled setting or asset identity.

## Product surfaces

### Choice-rich asset library

Each of the nine Quick categories exposes at least three compatible alternatives. Alternatives carry distinct names, previews, tags, content and visual identity. Their capability contracts allow intentional mixing while Descriptor validation still rejects unmet requirements and conflicting writes.

The gate assembles two different valid one-shots and proves their composed documents and materialized Worlds differ in named content and media.

### Advanced composition

The existing Advanced builder retains exact selection, dependency expansion, search, filters, parameters and preview diagnostics. It adds an explicit **Fork as full custom Pack** transition after a valid Descriptor project is saved.

The fork copies the composed Pack document and every referenced media byte into a Realm-owned draft Pack project. Its identity and lineage identify the source Descriptor revision. The immutable source assets and old Descriptor revision remain unchanged.

### Full Custom visual editor

The Pack Creator becomes the Full Custom editor. Browser controls cover every currently supported document structure:

- identity, terminology, theme and Art Set mappings;
- Descriptor questions and defaults;
- generators and value tables;
- templates, values, components, traits and constraints;
- relations, dependency nodes and scene templates;
- Character steps, fields, conditions, options, calculated values, starting state and portability rules;
- checks and dice, resources, effects, actions and action steps;
- items, progression, actor templates, locations and encounter ordering;
- fixtures, uploaded maps, portraits, tokens and backgrounds.

Read-only JSON/YAML remains inspection and export evidence. It is never required for authoring.

### Editing semantics

- Forked documents begin as drafts and use optimistic revision persistence.
- Published versions stay immutable; editing requires a new fork or version.
- Every collection entry has explicit add, edit and dependency-safe remove behavior.
- Removing a referenced entry is blocked with named inbound references.
- CUSTOM and LOCK remain materialized World semantics after compilation.
- Regeneration works at the selected World scope and preserves custom and locked values.
- Pack and World images load through authenticated fetches and object URLs; `<img>` URLs never bypass Realm authorization.

## Acceptance gate

Against disposable PostgreSQL and an actual browser:

1. The Quick library offers at least three choices in every canonical category.
2. Two different menu selections compile into visibly and structurally different Worlds.
3. A saved Descriptor is forked into a Realm-owned Full Custom draft with exact source lineage and media bytes.
4. Browser controls change rules, dice, an effect, an action, Character flow, generators, templates, relations, a scene and Art Set media without editing source.
5. Invalid dependency removal is rejected with the inbound reference; the corrected edit validates.
6. The draft is saved, validated, published and used to compile a distinct original World.
7. All rendered Pack and World media complete with non-zero natural dimensions.
8. CUSTOM, LOCK and scoped regeneration preserve authored state.
9. Server restart reads back the draft/published Pack, source lineage and materialized World.

TypeScript, ordinary tests, production build, clean database API acceptance, restart proof and headless browser acceptance form the reproducible gate.

## Limits after M13

- `.mhgame` transfer between installations belongs to M14.
- Complete real-table UX and rehearsal belong to M15.
- Release packaging and public installation acceptance belong to M16.

