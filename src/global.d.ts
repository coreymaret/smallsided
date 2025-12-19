// src/global.d.ts
export {};

declare global {
  interface Window {
    Buffer: any;
  }
  var Buffer: any;
}