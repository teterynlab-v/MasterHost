import React, { useEffect, useState } from "react";

export function AuthenticatedImage({ requestMedia, path, alt, className, onError }: { requestMedia: (path: string) => Promise<Blob>; path: string; alt: string; className?: string; onError?: (message: string) => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true, objectUrl = "";
    void requestMedia(path).then(blob => {
      objectUrl = URL.createObjectURL(blob);
      if (active) setUrl(objectUrl); else URL.revokeObjectURL(objectUrl);
    }).catch(reason => onError?.(reason instanceof Error ? reason.message : String(reason)));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [requestMedia, path]);
  return url ? <img className={className} src={url} alt={alt}/> : <span className="muted">Loading {alt}…</span>;
}
