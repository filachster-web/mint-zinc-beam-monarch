declare module "*.html?raw" {
  const content: string;
  export default content;
}

declare module "utif" {
  const utif: {
    decode: (buffer: ArrayBuffer) => Array<{ width: number; height: number }>;
    decodeImage: (buffer: ArrayBuffer, image: object) => void;
    toRGBA8: (image: object) => Uint8Array;
  };
  export default utif;
}

declare module "heic-decode" {
  function decode(input: { buffer: ArrayBuffer }): Promise<{ width: number; height: number; data: Uint8Array }>;
  export default decode;
}
