/// <reference types="vite/client" />

declare module '*.PNG' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

