# M2 Character System Acceptance

1. Start from a clean PostgreSQL database and load each bundled World Pack through the same server/runtime.
2. Confirm the Pack exposes a versioned Character schema with steps, fields/options, conditions, validation, calculations, assets, starting items and traits.
3. Join a Campaign as a first-time guest through its PIN.
4. Complete the Pack-defined builder; verify conditional UI and calculated preview.
5. Create the Character and read it back with Pack/version/schema compatibility, values, progression, inventory, resources, traits and assets.
6. Reject unknown, inactive and invalid Character input server side.
7. Rejoin as the same browser owner and reuse the compatible saved Character without rebuilding it.
8. Confirm an older Character is rejected by an exact-only Campaign.
9. Confirm a Campaign using Pack policy applies only an explicit accept/normalize/migrate rule and creates a current compatible copy when transformation is required.
10. Repeat the API acceptance for Fantasy and Cyberpunk; complete the first-time and returning-player gate in the browser.
