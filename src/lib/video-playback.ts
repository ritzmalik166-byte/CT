/** Shared video load/playback helpers. No UI changes — network and decoder only. */

export function normalizeVideoUrl(url: string): string {
  try {
    const parsed = new URL(
      url,
      typeof window === "undefined" ? "https://localhost/" : window.location.href
    );
    parsed.pathname = parsed.pathname.replace(
      /\.(mp4|mov|webm|MP4|MOV|WEBM)$/i,
      (ext) => ext.toLowerCase()
    );
    return parsed.href.split("?")[0];
  } catch {
    return url.split("?")[0];
  }
}

function attachedAttributeUrls(video: HTMLVideoElement): string[] {
  return [
    video.getAttribute("src"),
    ...Array.from(video.querySelectorAll("source")).map((s) => s.getAttribute("src")),
  ].filter((src): src is string => Boolean(src));
}

export function videoElementMatchesUrl(video: HTMLVideoElement, url: string): boolean {
  const target = normalizeVideoUrl(url);
  const candidates = [
    ...attachedAttributeUrls(video),
    video.dataset.src,
    video.currentSrc,
  ];
  return candidates.some((src) => src && normalizeVideoUrl(src) === target);
}

export function findPageVideoByUrl(url: string): HTMLVideoElement | null {
  if (typeof document === "undefined") return null;
  for (const el of document.querySelectorAll("video")) {
    if (videoElementMatchesUrl(el, url) && el.getAttribute("src")) return el;
  }
  return null;
}

function isActivelyLoaded(video: HTMLVideoElement, url: string): boolean {
  const attr = video.getAttribute("src");
  if (!attr || normalizeVideoUrl(attr) !== normalizeVideoUrl(url)) return false;
  if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) return false;
  if (video.readyState > HTMLMediaElement.HAVE_NOTHING) return true;
  return video.networkState === HTMLMediaElement.NETWORK_LOADING;
}

const pendingPlay = new WeakMap<HTMLVideoElement, () => void>();

function clearPendingPlay(video: HTMLVideoElement) {
  const onReady = pendingPlay.get(video);
  if (!onReady) return;
  video.removeEventListener("loadeddata", onReady);
  video.removeEventListener("canplay", onReady);
  pendingPlay.delete(video);
}

export function attachVideoSrc(video: HTMLVideoElement, url?: string): boolean {
  const next = url || video.dataset.src || "";
  if (!next) return false;
  if (isActivelyLoaded(video, next)) return false;
  // Never interrupt a playing element that already points at this file.
  if (
    !video.paused &&
    attachedAttributeUrls(video).some((src) => normalizeVideoUrl(src) === normalizeVideoUrl(next))
  ) {
    return false;
  }

  video.src = next;
  // After a prior release (`src=""` + load()), assigning the same URL again
  // does not start fetching until load() is called explicitly.
  video.load();
  return true;
}

export function releaseVideoSrc(video: HTMLVideoElement): void {
  if (video.closest("[data-keep-video]")) return;
  clearPendingPlay(video);
  if (!video.paused) video.pause();

  const hasResource =
    Boolean(video.getAttribute("src")) ||
    Boolean(video.currentSrc) ||
    video.readyState > HTMLMediaElement.HAVE_NOTHING ||
    video.querySelector("source[src]");
  if (!hasResource) return;

  video.removeAttribute("src");
  video.src = "";
  video.querySelectorAll("source").forEach((source) => {
    source.removeAttribute("src");
  });
  video.load();
}

export function warmVideoSrc(video: HTMLVideoElement, url?: string): void {
  attachVideoSrc(video, url);
  if (video.preload !== "auto") video.preload = "auto";
}

export function playVideoSafe(video: HTMLVideoElement): void {
  warmVideoSrc(video);
  video.muted = true;

  const tryPlay = () => {
    if (!video.paused) return;
    void video.play().catch(() => undefined);
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    tryPlay();
    return;
  }

  if (!pendingPlay.has(video)) {
    const onReady = () => {
      pendingPlay.delete(video);
      tryPlay();
    };
    pendingPlay.set(video, onReady);
    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
  }

  tryPlay();
}

export function pauseVideoSafe(video: HTMLVideoElement): void {
  if (!video.paused) video.pause();
}
