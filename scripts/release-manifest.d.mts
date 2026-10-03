export type ThirdPartyPackage = { name: string; version: string; license: string };
export const requiredReleaseFiles: string[];
export function releasePathAllowed(value: string): boolean;
export function createChecksumManifest(root: string, files: string[]): Promise<string>;
export function createReleaseArchive(parent: string, folder: string, archive: string): void;
export function collectThirdPartyPackages(root: string): Promise<ThirdPartyPackage[]>;
export function validateReleaseInventory(archiveFiles: string[], manifestFiles: string[]): void;
