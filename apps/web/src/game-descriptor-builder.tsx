import React, { useEffect, useMemo, useState } from "react";

type Scalar = string | number | boolean;
type Parameter =
  | { type: "string"; required?: boolean; default?: string; options?: string[] }
  | { type: "number"; required?: boolean; default?: number; min?: number; max?: number }
  | { type: "boolean"; required?: boolean; default?: boolean };
type Fragment = { id: string; version: string; name: string; description?: string; provides: string[]; requires: string[]; conflicts: string[]; parameters: Record<string, Parameter> };
type Selection = { fragmentId: string; version: string; parameters: Record<string, Scalar> };
type Report = { valid: boolean; diagnostics: { code: string; path: string; message: string }[]; providedCapabilities: string[]; writes: string[] };
type Project = { id: string; name: string; revision: number; seed: string; selections: Selection[]; decisions: Record<string, Scalar>; locks: string[]; compiled: { manifest: { id: string; version: string } }; report: Report };
type Question = { id: string; label: string; default: string; options: { value: string; label: string }[] };

interface Props {
  request: (path: string, init?: RequestInit) => Promise<any>;
  pack: { manifest: { id: string; version: string }; questions: Question[] };
  onWorld: (world: any) => Promise<void> | void;
  onBack: () => void;
}

function defaults(fragment: Fragment) {
  return Object.fromEntries(Object.entries(fragment.parameters).flatMap(([key, definition]) => definition.default === undefined ? [] : [[key, definition.default]]));
}

export function GameDescriptorBuilder({ request, pack, onWorld, onBack }: Props) {
  const [fragments, setFragments] = useState<Fragment[]>([]), [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null), [name, setName] = useState("Untitled Game"), [seed, setSeed] = useState("masterhost-game"), [selections, setSelections] = useState<Selection[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Scalar>>(() => Object.fromEntries(pack.questions.map(question => [question.id, question.default]))), [locks, setLocks] = useState<string[]>([]);
  const [search, setSearch] = useState(""), [preview, setPreview] = useState<{ document: Project["compiled"]; report: Report } | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false);

  const loadProject = (next: Project) => {
    setProject(next); setName(next.name); setSeed(next.seed); setSelections(structuredClone(next.selections)); setDecisions(structuredClone(next.decisions)); setLocks([...next.locks]); setPreview(null); setDirty(false); setError("");
  };
  useEffect(() => { void Promise.all([request("/game-fragments"), request("/game-descriptors")]).then(([catalog, saved]: [Fragment[], Project[]]) => { setFragments(catalog); setProjects(saved); if (saved[0]) loadProject(saved[0]); }).catch((reason: Error) => setError(reason.message)); }, []);

  const visible = useMemo(() => fragments.filter(fragment => `${fragment.name} ${fragment.description ?? ""} ${fragment.provides.join(" ")}`.toLowerCase().includes(search.toLowerCase())), [fragments, search]);
  const selected = (id: string) => selections.find(value => value.fragmentId === id);
  const change = (next: Selection[]) => { setSelections(next); setPreview(null); setDirty(true); };
  const toggle = (fragment: Fragment) => {
    const current = selected(fragment.id);
    change(current ? selections.filter(value => value.fragmentId !== fragment.id) : [...selections, { fragmentId: fragment.id, version: fragment.version, parameters: defaults(fragment) }]);
  };
  const setParameter = (fragmentId: string, key: string, value: Scalar) => change(selections.map(selection => selection.fragmentId === fragmentId ? { ...selection, parameters: { ...selection.parameters, [key]: value } } : selection));
  const body = () => JSON.stringify({ name: name.trim(), seed: seed.trim(), basePack: pack.manifest, selections, decisions, locks });
  const run = async (action: () => Promise<void>) => { try { setBusy(true); setError(""); await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); } finally { setBusy(false); } };
  const save = async () => run(async () => {
    const next = await request(project ? `/game-descriptors/${project.id}` : "/game-descriptors", { method: project ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: project ? JSON.stringify({ ...JSON.parse(body()), expectedRevision: project.revision }) : body() }) as Project;
    setProjects(current => [next, ...current.filter(value => value.id !== next.id)]); loadProject(next);
  });
  const inspect = async () => run(async () => { if (!project || dirty) throw Error("Save the project before previewing it"); setPreview(await request(`/game-descriptors/${project.id}/preview`, { method: "POST" })); });
  const compile = async () => run(async () => { if (!project || dirty) throw Error("Save the project before compiling it"); await onWorld(await request(`/game-descriptors/${project.id}/compile`, { method: "POST" })); });

  const groupedDiagnostics = (preview?.report.diagnostics ?? []).reduce<Record<string, Report["diagnostics"]>>((groups, diagnostic) => { (groups[diagnostic.code] ??= []).push(diagnostic); return groups; }, {});
  return <main className="gameDescriptorBuilder">
    <div className="titleRow"><div><h1>DYNAMIC GAME BUILDER</h1><p className="muted">Choose Pack fragments explicitly. MasterHost composes a versioned game Descriptor.</p></div><button className="secondary" onClick={onBack}>Back</button></div>
    {error && <p className="error">{error}</p>}
    {projects.length > 0 && <section><h2>Saved games</h2><div className="actions">{projects.map(saved => <button key={saved.id} className={project?.id === saved.id ? "selected" : "secondary"} onClick={() => loadProject(saved)}>{saved.name} · r{saved.revision}</button>)}</div><button className="secondary" onClick={() => { setProject(null); setName("Untitled Game"); setSeed("masterhost-game"); setSelections([]); setDecisions(Object.fromEntries(pack.questions.map(question => [question.id, question.default]))); setLocks([]); setPreview(null); setDirty(false); }}>New game</button></section>}
    <section><h2>Game identity</h2><label>Game name<input aria-label="Game name" value={name} onChange={event => { setName(event.target.value); setDirty(true); }}/></label><label>Deterministic seed<input aria-label="Deterministic seed" value={seed} onChange={event => { setSeed(event.target.value); setDirty(true); }}/></label><p className="muted">Base Pack · <code>{pack.manifest.id}@{pack.manifest.version}</code></p></section>
    <section><div className="titleRow"><div><h2>Fragment library</h2><p className="muted">Selected fragments · {selections.length}</p></div><input aria-label="Search fragments" placeholder="Search fragments" value={search} onChange={event => setSearch(event.target.value)}/></div><div className="fragmentGrid">{visible.map(fragment => <article key={`${fragment.id}@${fragment.version}`}><h3>{fragment.name}</h3><p>{fragment.description}</p><small>Provides · {fragment.provides.join(" · ") || "none"}</small><small>Requires · {fragment.requires.join(" · ") || "none"}</small><small>Conflicts · {fragment.conflicts.join(" · ") || "none"}</small><button data-fragment-id={fragment.id} className={selected(fragment.id) ? "selected" : "secondary"} onClick={() => toggle(fragment)}>{selected(fragment.id) ? "SELECTED" : "SELECT"}</button></article>)}</div></section>
    {selections.length > 0 && <section><h2>Composition order</h2>{selections.map((selection, index) => { const fragment = fragments.find(value => value.id === selection.fragmentId); return <div className="compactRow" key={selection.fragmentId}><b>{index + 1}. {fragment?.name ?? selection.fragmentId}</b><code>{selection.version}</code></div>; })}</section>}
    {selections.map(selection => { const fragment = fragments.find(value => value.id === selection.fragmentId); if (!fragment) return null; return <section key={selection.fragmentId}><h2>{fragment.name} parameters</h2>{Object.entries(fragment.parameters).map(([key, definition]) => <label key={key}>{key}{definition.type === "boolean" ? <input aria-label={`Parameter ${key}`} type="checkbox" checked={Boolean(selection.parameters[key])} onChange={event => setParameter(fragment.id, key, event.target.checked)}/> : definition.type === "string" && definition.options ? <select aria-label={`Parameter ${key}`} value={String(selection.parameters[key] ?? "")} onChange={event => setParameter(fragment.id, key, event.target.value)}>{definition.options.map(option => <option key={option}>{option}</option>)}</select> : <input aria-label={`Parameter ${key}`} type={definition.type === "number" ? "number" : "text"} min={definition.type === "number" ? definition.min : undefined} max={definition.type === "number" ? definition.max : undefined} value={String(selection.parameters[key] ?? "")} onChange={event => setParameter(fragment.id, key, definition.type === "number" ? Number(event.target.value) : event.target.value)}/>}</label>)}</section>; })}
    {pack.questions.length > 0 && <section><h2>World decisions</h2>{pack.questions.map(question => <div key={question.id}><label>{question.label}<select value={String(decisions[question.id] ?? question.default)} onChange={event => { setDecisions(current => ({ ...current, [question.id]: event.target.value })); setDirty(true); }}>{question.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="lockChoice">Lock decision<input type="checkbox" checked={locks.includes(question.id)} onChange={event => { setLocks(current => event.target.checked ? [...new Set([...current, question.id])] : current.filter(value => value !== question.id)); setDirty(true); }}/></label></div>)}</section>}
    <section className="packActions"><div className="actions"><button disabled={busy || !name.trim()} onClick={save}>{project ? "SAVE REVISION" : "CREATE PROJECT"}</button><button disabled={busy || !project || dirty} onClick={inspect}>PREVIEW</button><button disabled={busy || !project || dirty} onClick={compile}>COMPILE WORLD</button></div>{project && <p className="muted">Revision {project.revision} · <code>{project.compiled.manifest.id}@{project.compiled.manifest.version}</code>{dirty && " · unsaved changes"}</p>}</section>
    {preview && <section><h2>{preview.report.valid ? "VALID" : "INVALID"}</h2><p>Composed Pack · <code>{preview.document.manifest.version}</code></p><p>{preview.report.providedCapabilities.map(capability => <span className="tag" key={capability}>{capability}</span>)}</p>{Object.entries(groupedDiagnostics).map(([code, diagnostics]) => <article key={code}><h3>{code}</h3>{diagnostics.map((diagnostic, index) => <p key={`${diagnostic.path}-${index}`}><code>{diagnostic.path}</code> · {diagnostic.message}</p>)}</article>)}</section>}
  </main>;
}
