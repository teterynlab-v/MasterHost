import React, { useEffect, useMemo, useState } from "react";
import { readQuickStartHandoff } from "./universe-catalog.js";

type Identity = { id: string; version: string };
type Scalar = string | number | boolean;
type Parameter = { type: "string"; required?: boolean; default?: string; options?: string[] } | { type: "number"; required?: boolean; default?: number; min?: number; max?: number } | { type: "boolean"; required?: boolean; default?: boolean };
type Asset = Identity & { type: string; name: string; description: string; tags: string[]; preview: { summary: string; highlights: string[] }; dependencies: Identity[]; license: { spdx: string; attribution: string; source: string }; counts: Record<string, number>; contentChecksum: string; media: { name: string; checksum: string }[]; compatibility: { basePackIds: string[] }; fragment: { provides:string[]; requires:string[]; parameters: Record<string, Parameter> } };
type Selection = Identity & { parameters: Record<string, Scalar> };
type Question = { id: string; label: string; default: string; options: { value: string; label: string }[] };
type Review = { ready: boolean; diagnostics: { code: string; message: string }[]; orderedSelections: Identity[]; selected: (Identity & { type: string; name: string })[]; counts: Record<string, number>; licenses: { spdx: string; attribution: string; source: string }[] };
type Preview = { report: { valid: boolean; diagnostics: { code: string; path: string; message: string }[] } };

interface Props { request: (path: string, init?: RequestInit) => Promise<any>; requestMedia: (path: string) => Promise<Blob>; pack: { manifest: { id: string; version: string }; questions: Question[] }; onWorld: (world: any) => Promise<void> | void; onBack: () => void; onAdvanced: () => void }
type MenuAsset = Identity & {type:string;preview:{highlights:string[]};dependencies:Identity[];compatibility:{basePackIds:string[]};fragment:{provides:string[];requires:string[]}};
export function playTodayAssets<T extends MenuAsset>(assets:T[], basePackId?:string):T[]{
 const coherent=(bundle:T[])=>{
  if(!categories.every(category=>bundle.filter(asset=>asset.type===category.type).length===1))return false;
  const identities=new Set(bundle.map(asset=>`${asset.id}@${asset.version}`));
  const capabilities=new Set(bundle.flatMap(asset=>asset.fragment.provides));
  return bundle.every(asset=>(!basePackId||asset.compatibility.basePackIds.includes(basePackId))&&asset.dependencies.every(dependency=>identities.has(`${dependency.id}@${dependency.version}`))&&asset.fragment.requires.every(capability=>capabilities.has(capability)));
 };
 for(const highlight of ["Illustrated Universe v1","Deep Universe Standard v1"]){
  const matching=assets.filter(asset=>asset.preview.highlights.includes(highlight));
  for(const version of [...new Set(matching.map(asset=>asset.version))].sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))){
   const bundle=matching.filter(asset=>asset.version===version);
   if(coherent(bundle))return bundle;
  }
 }
 return assets;
}
export function quickStartMatchesPack(value: ReturnType<typeof readQuickStartHandoff>, pack: Props["pack"]) { return !value || (pack.manifest.id === value.basePack.id && pack.manifest.version === value.basePack.version); }
export function initialQuickDecisions(questions: Question[], quickStart: ReturnType<typeof readQuickStartHandoff>) {
  const decisions = Object.fromEntries(questions.map(question => [question.id, question.default]));
  if (!quickStart) return decisions;
  const selected: Record<string, string> = { "world.pattern": quickStart.patternId, "world.campaignKit": quickStart.campaignKitId, "world.visualTheme": quickStart.visualThemeId };
  for (const question of questions) if (selected[question.id] && question.options.some(option => option.value === selected[question.id])) decisions[question.id] = selected[question.id]!;
  return decisions;
}

const categories = [
  { type: "setting", title: "Setting", prompt: "Choose the premise and tone foundation." },
  { type: "world-template", title: "World template", prompt: "Choose the structure that holds the adventure." },
  { type: "locations", title: "Locations", prompt: "Choose the places available during play." },
  { type: "cast", title: "Cast", prompt: "Choose NPCs and creatures." },
  { type: "items", title: "Items, clues and rewards", prompt: "Choose the objects that drive discovery and reward." },
  { type: "rules", title: "Rules", prompt: "Choose checks, actions, resources and effects." },
  { type: "characters", title: "Character Builder", prompt: "Choose archetypes and starting state." },
  { type: "adventure", title: "Adventure, scenes and encounters", prompt: "Choose the playable plot structure." },
  { type: "visuals", title: "Visual style", prompt: "Choose maps, portraits, tokens and backgrounds." },
] as const;
type FlowStep = { kind: "name" } | { kind: "category"; type: typeof categories[number]["type"] } | { kind: "decisions" } | { kind: "review" };
export function quickBuilderFlow(assets: Pick<Asset,"type"|"fragment">[]): FlowStep[] {
  return [{ kind: "name" }, ...categories.filter(category => assets.filter(asset => asset.type === category.type).length !== 1).map(category => ({ kind: "category" as const, type: category.type })), { kind: "decisions" }, { kind: "review" }];
}

const identity = (value: Identity) => `${value.id}@${value.version}`;
function parameterDefaults(asset: Asset) {
  return Object.fromEntries(Object.entries(asset.fragment.parameters).flatMap(([key, definition]) => {
    if (definition.default !== undefined) return [[key, definition.default]];
    if (definition.type === "boolean" && definition.required) return [[key, false]];
    if (definition.type === "string" && definition.required && definition.options?.length) return [[key, definition.options[0]!]];
    return [];
  })) as Record<string, Scalar>;
}
function parametersValid(asset: Asset, values: Record<string, Scalar>) {
  return Object.entries(asset.fragment.parameters).every(([key, definition]) => {
    const value = values[key];
    if (value === undefined) return !definition.required;
    if (typeof value !== definition.type) return false;
    if (definition.type === "string" && definition.options && !definition.options.includes(value as string)) return false;
    if (definition.type === "number" && definition.min !== undefined && (value as number) < definition.min) return false;
    if (definition.type === "number" && definition.max !== undefined && (value as number) > definition.max) return false;
    return true;
  });
}

function MediaPreview({ asset, requestMedia, onError }: { asset: Asset; requestMedia: Props["requestMedia"]; onError: (message: string) => void }) {
  const media = asset.media[0], [url, setUrl] = useState("");
  useEffect(() => { let active = true, objectUrl = ""; if (media) void requestMedia(`/game-assets/media/${media.checksum}/${media.name.split("/").map(encodeURIComponent).join("/")}`).then(blob => { objectUrl = URL.createObjectURL(blob); if (active) setUrl(objectUrl); else URL.revokeObjectURL(objectUrl); }).catch(reason => onError(reason instanceof Error ? reason.message : String(reason))); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [media?.checksum, media?.name]);
  return url ? <img className="quickAssetPreview" src={url} alt={`${asset.name} preview`}/> : null;
}

export function QuickGameBuilder({ request, requestMedia, pack, onWorld, onBack, onAdvanced }: Props) {
  const [quickStart] = useState(() => typeof sessionStorage === "undefined" ? undefined : readQuickStartHandoff(sessionStorage));
  const [assets, setAssets] = useState<Asset[]>([]), [step, setStep] = useState(0), [name, setName] = useState(quickStart ? `${quickStart.universeName} One-shot` : "Untitled One-shot"), [seed, setSeed] = useState(quickStart ? `play-today-${quickStart.universeId}` : "masterhost-quick-game"), [selected, setSelected] = useState<Record<string, Selection>>({});
  const [decisions, setDecisions] = useState<Record<string, string>>(() => initialQuickDecisions(pack.questions, quickStart)), [review, setReview] = useState<Review | null>(null), [preview, setPreview] = useState<Preview | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const exactPackActive = quickStartMatchesPack(quickStart, pack);
  useEffect(() => { void request(`/game-assets?basePackId=${encodeURIComponent(pack.manifest.id)}`).then(values=>setAssets(quickStart?playTodayAssets(values,pack.manifest.id):values)).catch(reason => setError(reason.message)); }, []);
  useEffect(() => { if (!assets.length) return; setSelected(current => { const next = { ...current }; for (const category of categories) { const matches = assets.filter(asset => asset.type === category.type); if (matches.length === 1 && !next[category.type]) next[category.type] = { id: matches[0]!.id, version: matches[0]!.version, parameters: parameterDefaults(matches[0]!) }; } return next; }); }, [assets]);
  const flow = useMemo(() => quickBuilderFlow(assets), [assets]), flowStep = flow[Math.min(step, flow.length - 1)]!, category = flowStep.kind === "category" ? categories.find(value => value.type === flowStep.type)! : null, choices = useMemo(() => category ? assets.filter(asset => asset.type === category.type) : [], [assets, category?.type]);
  const decisionQuestions = pack.questions.filter(question => !quickStart || !["world.pattern", "world.campaignKit", "world.visualTheme"].includes(question.id));
  const invalidate = () => { setReview(null); setPreview(null); };
  const identities = () => Object.values(selected).map(({ id, version }) => ({ id, version }));
  const descriptorPayload = (ordered: Identity[]) => ({ name: name.trim(), seed: seed.trim(), basePack: pack.manifest, selections: ordered.map(value => ({ fragmentId: value.id, version: value.version, parameters: Object.values(selected).find(selection => identity(selection) === identity(value))?.parameters ?? {} })), decisions, locks: [] });
  const loadReview = async () => { setBusy(true); setError(""); setReview(null); setPreview(null); try { const next = await request("/game-assets/quick-review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ basePack: pack.manifest, selections: identities() }) }) as Review; setReview(next); if (next.ready) setPreview(await request("/game-descriptors/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(descriptorPayload(next.orderedSelections)) })); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); } finally { setBusy(false); } };
  useEffect(() => { if (flowStep.kind === "review") void loadReview(); }, [flowStep.kind]);
  const currentAsset = category ? choices.find(asset => identity(asset) === identity(selected[category.type] ?? { id: "", version: "" })) : undefined;
  const nextDisabled = !exactPackActive || (flowStep.kind === "name" ? !name.trim() || !seed.trim() : Boolean(category && (!currentAsset || !parametersValid(currentAsset, selected[category.type]!.parameters))));
  const create = async () => { if (!exactPackActive || !review?.ready || !preview?.report.valid) return; try { setBusy(true); setError(""); const project = await request("/game-descriptors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(descriptorPayload(review.orderedSelections)) }); await onWorld(await request(`/game-descriptors/${project.id}/compile`, { method: "POST" })); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); } finally { setBusy(false); } };
  const chosenAssets = categories.map(value => assets.find(asset => asset.id === selected[value.type]?.id && asset.version === selected[value.type]?.version)).filter((value): value is Asset => Boolean(value));
  return <main className="quickGameBuilder">
    <div className="titleRow"><div><h1>QUICK GAME BUILDER</h1><p className="muted">Build a complete one-shot from compatible published assets.</p></div><div className="actions"><button className="secondary" onClick={onAdvanced}>Advanced mode</button><button className="secondary" onClick={onBack}>Back</button></div></div>
    <section className="quickProgress"><b>Step {step + 1} of {flow.length}</b><div>{flow.map((_, index) => <span key={index} className={index <= step ? "done" : ""}/>)}</div></section>
    {error && (/Creator role required|authorization required/i.test(error)?<section className="notice"><h2>Connect your creator access</h2><p>Use the creator access supplied by the host of this Realm, then return to choose your game.</p><button onClick={()=>{location.hash="realm"}}>Open Realm access</button></section>:<p className="error">{error}</p>)}
    {flowStep.kind === "name" && <section><h2>Name your game</h2><p className="muted">Choose a name now. MasterHost has already assembled the compatible content.</p>{quickStart&&<article className="quickStartSummary"><h3>{quickStart.universeName}</h3><p>Your chosen universe pattern and its complete campaign kit will be included automatically.</p>{!exactPackActive&&<p className="error">This universe is temporarily unavailable. Return to the collection and choose it again.</p>}</article>}<label>Game name<input aria-label="Quick game name" value={name} onChange={event => { setName(event.target.value); invalidate(); }}/></label><details><summary>Advanced generation settings</summary><label>Deterministic seed<input aria-label="Quick game seed" value={seed} onChange={event => { setSeed(event.target.value); invalidate(); }}/></label></details></section>}
    {category && <section><h2>{category.title}</h2><p>{category.prompt}</p>{choices.length === 0 ? <p className="error">No compatible {category.type} asset is installed for this Pack.</p> : <div className="quickChoices">{choices.map(asset => { const active = selected[category.type]?.id === asset.id && selected[category.type]?.version === asset.version, values = active ? selected[category.type]!.parameters : {}; const setParameter = (key: string, value: Scalar | undefined) => { setSelected(current => { const parameters = { ...current[category.type]!.parameters }; if (value === undefined) delete parameters[key]; else parameters[key] = value; return { ...current, [category.type]: { ...current[category.type]!, parameters } }; }); invalidate(); }; return <article key={`${asset.id}@${asset.version}`} className={active ? "selected" : ""}><MediaPreview asset={asset} requestMedia={requestMedia} onError={setError}/><h3>{asset.name}</h3><p>{asset.preview.summary}</p><p>{asset.preview.highlights.map(value => <span className="tag" key={value}>{value}</span>)}</p><small>{Object.entries(asset.counts).filter(([, count]) => count > 0).map(([key, count]) => `${count} ${key}`).join(" · ")}</small><small>Requires · {asset.dependencies.map(value => `${value.id}@${value.version}`).join(" · ") || "none"}</small><small>{asset.license.spdx} · {asset.license.attribution}</small><button data-quick-asset-id={asset.id} className={active ? "selected" : "secondary"} onClick={() => { setSelected(current => ({ ...current, [category.type]: { id: asset.id, version: asset.version, parameters: parameterDefaults(asset) } })); invalidate(); }}>{active ? "CHOSEN" : "CHOOSE"}</button>{active && Object.entries(asset.fragment.parameters).length > 0 && <div className="quickParameters"><h4>Customize this asset</h4>{Object.entries(asset.fragment.parameters).map(([key, definition]) => <label key={key}>{key}{definition.required && " · required"}{definition.type === "boolean" ? <input aria-label={`Quick parameter ${key}`} type="checkbox" checked={Boolean(values[key])} onChange={event => setParameter(key, event.target.checked)}/> : definition.type === "string" && definition.options ? <select aria-label={`Quick parameter ${key}`} value={String(values[key] ?? "")} onChange={event => setParameter(key, event.target.value === "" ? undefined : event.target.value)}>{!definition.required && <option value="">Use asset default</option>}{definition.options.map(option => <option key={option}>{option}</option>)}</select> : <input aria-label={`Quick parameter ${key}`} type={definition.type === "number" ? "number" : "text"} min={definition.type === "number" ? definition.min : undefined} max={definition.type === "number" ? definition.max : undefined} value={String(values[key] ?? "")} onChange={event => setParameter(key, event.target.value === "" ? undefined : definition.type === "number" ? Number(event.target.value) : event.target.value)}/>}</label>)}</div>}</article>; })}</div>}</section>}
    {flowStep.kind === "decisions" && <section><h2>Shape the game</h2><p className="muted">Only choices that change this game are shown here.</p>{decisionQuestions.map(question => <label key={question.id}>{question.label}<select aria-label={`Decision ${question.id}`} value={decisions[question.id] ?? question.default} onChange={event => { setDecisions(current => ({ ...current, [question.id]: event.target.value })); invalidate(); }}>{question.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}</section>}
    {flowStep.kind === "review" && <section><h2>Ready to create</h2>{busy && <p>Checking that every part works together…</p>}{review && <><h3>{review.ready && preview?.report.valid ? "Your game is complete" : "Something still needs attention"}</h3><div className="quickReviewGrid"><article><h3>Included content</h3>{chosenAssets.map(asset => <div key={asset.id}>{asset.media[0] && <MediaPreview asset={asset} requestMedia={requestMedia} onError={setError}/>}<b>{asset.name}</b><p>{asset.preview.summary}</p></div>)}</article><article><h3>What is ready</h3><p>{Object.entries(review.counts).map(([key, count]) => <span className="tag" key={key}>{count} {key}</span>)}</p></article><article><h3>Your choices</h3>{pack.questions.map(question => <p key={question.id}>{question.label} · <b>{question.options.find(option => option.value === decisions[question.id])?.label}</b></p>)}</article><details><summary>Licenses and technical details</summary>{review.licenses.map(value => <p key={value.source}><b>{value.spdx}</b><br/><small>{value.attribution}</small></p>)}</details></div>{review.diagnostics.map(value => <p className="error" key={`${value.code}-${value.message}`}>{value.message}</p>)}{preview?.report.diagnostics.map(value => <p className="error" key={`${value.path}-${value.message}`}>{value.message}</p>)}</>}
      <button disabled={!exactPackActive || busy || !review?.ready || !preview?.report.valid} onClick={create}>Create game</button></section>}
    <section className="quickNavigation"><button className="secondary" disabled={step === 0 || busy} onClick={() => setStep(value => value - 1)}>Back</button>{step < flow.length - 1 && <button disabled={busy || nextDisabled} onClick={() => setStep(value => value + 1)}>Continue</button>}</section>
  </main>;
}
