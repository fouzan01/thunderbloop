// ts/jsx.d.ts
/// <reference types="react" />

declare namespace JSX {
  interface Element {}
  interface ElementClass {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
