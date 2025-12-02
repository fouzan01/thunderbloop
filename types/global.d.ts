/**
 * Global declarations for the YouTube IFrame API used by our client pages.
 * Keep a single declaration here to avoid duplicate/contradicting Window augmentations.
 */

declare global {
  interface Window {
    /** YouTube IFrame API global object (loaded from https://www.youtube.com/iframe_api) */
    YT?: any;
    /** Optional callback called by the YouTube iframe API when it has loaded */
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {}; // keep this file a module to avoid accidental global leakage
