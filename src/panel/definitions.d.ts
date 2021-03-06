declare module "*.svg";

declare namespace NodeJS {
  interface Global {
    matchMedia: jest.Mock;
  }
  export interface ProcessEnv {
    NODE_ENV: "production" | "development" | "testing";
    BUILD_ENV: "extension" | "electron";
    PKG_VERSION: string;
  }
}

/**
 * Implicit prism declaration (injected by ./prism.ts).
 */
declare const Prism: import("prismjs");
