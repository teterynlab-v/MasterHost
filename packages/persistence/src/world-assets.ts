import { createHash } from "node:crypto";

export const assetChecksum = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
export function validateWorldImage(path: string, mediaType: string, data: Uint8Array) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(path) || !data.length || data.length > 2_000_000) throw Error("Invalid asset name or size");
  const header = Buffer.from(data);
  const valid = mediaType === "image/png" && header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    || mediaType === "image/jpeg" && header[0] === 255 && header[1] === 216 && header.at(-2) === 255 && header.at(-1) === 217
    || mediaType === "image/webp" && header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8, 12) === "WEBP";
  if (!valid) throw Error("Unsupported or invalid image asset");
}
