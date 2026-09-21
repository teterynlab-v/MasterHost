export const gmWorkspaces=["table","checks","encounter","party","journal"] as const;export type GmWorkspace=(typeof gmWorkspaces)[number];export const initialGmWorkspace=():GmWorkspace=>"table";
