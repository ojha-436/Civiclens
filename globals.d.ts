// Ambient declarations for CDN imports and browser globals not in standard lib.d.ts

// Firebase CDN ESM modules loaded from gstatic — browser understands, tsc doesn't
declare module 'https://www.gstatic.com/firebasejs/*';

// firebase/app type stub for JSDoc @type {import('firebase/app').FirebaseOptions}
declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }
}

// Window augmentation for GA4 gtag and dataLayer globals
interface Window {
  /** GA4 tag function injected by googletagmanager script */
  gtag: (command: string, ...args: unknown[]) => void;
  /** GA4 data layer array */
  dataLayer: unknown[];
  /** Legacy Do-Not-Track string ('1' | '0' | null | undefined) */
  doNotTrack: string | null | undefined;
}
