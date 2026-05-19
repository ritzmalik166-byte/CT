const AZURE_BLOB_ORIGIN = "https://contenaissance.blob.core.windows.net";

const preloadedUrls = new Set<string>();
const hiddenVideos = new Map<string, HTMLVideoElement>();

/** Warm DNS + TLS to Azure Blob (safe to call once). */
export function ensureReelStoragePreconnect() {
  if (typeof document === "undefined") return;

  const addLink = (rel: string) => {
    if (document.querySelector(`link[rel="${rel}"][href="${AZURE_BLOB_ORIGIN}"]`)) return;
    const link = document.createElement("link");
    link.rel = rel;
    link.href = AZURE_BLOB_ORIGIN;
    document.head.appendChild(link);
  };

  addLink("dns-prefetch");
  addLink("preconnect");
}

/**
 * Start buffering a reel before the modal opens (hover / touch / click).
 * Reuses the same hidden element per URL so repeat opens are instant.
 */
export function preloadReelVideo(url: string) {
  if (typeof document === "undefined" || !url || preloadedUrls.has(url)) return;

  ensureReelStoragePreconnect();
  preloadedUrls.add(url);

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = url;
  document.head.appendChild(link);

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("webkit-playsinline", "true");
  video.src = url;
  video.load();
  hiddenVideos.set(url, video);
}

/** Open modal + preload in one step. */
export function openReelWithPreload<T extends { video: string }>(
  reel: T,
  setReel: (reel: T) => void
) {
  preloadReelVideo(reel.video);
  setReel(reel);
}
