interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  doNotTrack: string | null | undefined;
}
