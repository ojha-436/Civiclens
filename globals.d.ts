declare module 'https://www.gstatic.com/firebasejs/*';
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
