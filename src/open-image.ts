export type FrameFile = {
  fileName: string;
  previewUrl: string;
  thumb: string;
  image: string;
  width: number;
  height: number;
  aspect: string;
};

const RATIOS: Array<[number, number]> = [
  [1, 1],
  [4, 5],
  [3, 4],
  [2, 3],
  [9, 16],
  [5, 4],
  [4, 3],
  [3, 2],
  [16, 9],
  [21, 9],
];

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jpe: "image/jpeg",
  jfif: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  dib: "image/bmp",
  avif: "image/avif",
  ico: "image/x-icon",
  cur: "image/x-icon",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
};

type Rgba = { width: number; height: number; rgba: Uint8ClampedArray };

function extensionOf(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  return match ? match[1].toLowerCase() : "";
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let text = "";
  for (let index = 0; index < length && start + index < bytes.length; index += 1) {
    text += String.fromCharCode(bytes[start + index]);
  }
  return text.toLowerCase();
}

function sniffMime(bytes: Uint8Array, name: string): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    ascii(bytes, 8, 4) === "webp"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
  ) {
    return "image/tiff";
  }
  if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
    return "image/x-icon";
  }
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (brand.startsWith("hei") || brand === "mif1" || brand === "msf1") return "image/heic";
  }
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 240)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return EXT_MIME[extensionOf(name)] ?? null;
}

function nearestAspect(width: number, height: number): string {
  const ratio = width / height;
  let best = RATIOS[0];
  let bestGap = Number.POSITIVE_INFINITY;
  for (const pair of RATIOS) {
    const gap = Math.abs(ratio - pair[0] / pair[1]);
    if (gap < bestGap) {
      best = pair;
      bestGap = gap;
    }
  }
  return `${best[0]}:${best[1]}`;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) resolve(image);
      else reject(new Error("empty"));
    };
    image.onerror = () => reject(new Error("error"));
    image.src = src;
  });
}

async function imageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await loadImageElement(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function paint(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, name: string): FrameFile {
  const scale = Math.min(1, 1536 / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Не удалось подготовить кадр.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  const image = canvas.toDataURL("image/jpeg", 0.86);
  const thumbScale = Math.min(1, 160 / Math.max(width, height));
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = Math.max(1, Math.round(width * thumbScale));
  thumbCanvas.height = Math.max(1, Math.round(height * thumbScale));
  const thumbContext = thumbCanvas.getContext("2d");
  if (!thumbContext) throw new Error("Не удалось подготовить кадр.");
  thumbContext.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  return {
    fileName: name || "кадр",
    previewUrl: image,
    thumb: thumbCanvas.toDataURL("image/jpeg", 0.72),
    image,
    width: sourceWidth,
    height: sourceHeight,
    aspect: nearestAspect(sourceWidth, sourceHeight),
  };
}

function bytesCopy(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
  copy.set(bytes);
  return copy;
}

function bufferCopy(bytes: Uint8Array): ArrayBuffer {
  return bytesCopy(bytes).buffer;
}

function paintRgba(frame: Rgba, name: string): FrameFile {
  const maxEdge = 1536;
  const scale = Math.min(1, maxEdge / Math.max(frame.width, frame.height));
  const width = Math.max(1, Math.round(frame.width * scale));
  const height = Math.max(1, Math.round(frame.height * scale));
  const raw =
    width === frame.width && height === frame.height
      ? frame.rgba
      : downsample(frame.rgba, frame.width, frame.height, width, height);
  const pixels = new Uint8ClampedArray(new ArrayBuffer(raw.byteLength));
  pixels.set(raw);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Не удалось подготовить кадр.");
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), width, height), 0, 0);
  return paint(canvas, frame.width, frame.height, name);
}

function downsample(src: Uint8ClampedArray, sourceWidth: number, sourceHeight: number, width: number, height: number) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sourceY = Math.min(sourceHeight - 1, Math.floor((y * sourceHeight) / height));
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor((x * sourceWidth) / width));
      const from = (sourceY * sourceWidth + sourceX) * 4;
      const to = (y * width + x) * 4;
      pixels[to] = src[from];
      pixels[to + 1] = src[from + 1];
      pixels[to + 2] = src[from + 2];
      pixels[to + 3] = src[from + 3];
    }
  }
  return pixels;
}

async function tryBlob(bytes: Uint8Array, type: string): Promise<HTMLImageElement | null> {
  try {
    return await imageFromBlob(new Blob([bytesCopy(bytes)], { type }));
  } catch {
    return null;
  }
}

function jpegSlice(bytes: Uint8Array): Uint8Array | null {
  const limit = Math.min(bytes.length - 2, 65536);
  for (let index = 0; index < limit; index += 1) {
    if (bytes[index] === 0xff && bytes[index + 1] === 0xd8 && bytes[index + 2] === 0xff) {
      return index === 0 ? bytes : bytes.subarray(index);
    }
  }
  return null;
}

async function decodeJpeg(bytes: Uint8Array): Promise<Rgba> {
  const mod = (await import("jpeg-js")) as {
    decode?: (data: Uint8Array, options: object) => { width: number; height: number; data: Uint8Array };
    default?: { decode: (data: Uint8Array, options: object) => { width: number; height: number; data: Uint8Array } };
  };
  const decode = mod.decode ?? mod.default?.decode;
  if (!decode) throw new Error("jpeg");
  const decoded = decode(bytes, {
    useTArray: true,
    formatAsRGBA: true,
    tolerantDecoding: true,
    maxResolutionInMP: 40,
  });
  if (!decoded.width || !decoded.height || decoded.data.length < decoded.width * decoded.height * 4) {
    throw new Error("jpeg");
  }
  return {
    width: decoded.width,
    height: decoded.height,
    rgba: decoded.data instanceof Uint8ClampedArray ? decoded.data : new Uint8ClampedArray(decoded.data),
  };
}

function decodeBmp(bytes: Uint8Array): Rgba | null {
  if (bytes.length < 54 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pixelOffset = view.getUint32(10, true);
  const header = view.getUint32(14, true);
  if (header < 40) return null;
  const width = view.getInt32(18, true);
  let height = view.getInt32(22, true);
  const topDown = height < 0;
  height = Math.abs(height);
  const bpp = view.getUint16(28, true);
  const compression = view.getUint32(30, true);
  if (width < 1 || height < 1 || width > 16000 || height > 16000) return null;
  if (compression !== 0 || (bpp !== 24 && bpp !== 32)) return null;
  const rgba = new Uint8ClampedArray(width * height * 4);
  const stride = Math.ceil((bpp * width) / 32) * 4;
  const channels = bpp / 8;
  for (let y = 0; y < height; y += 1) {
    const sourceY = topDown ? y : height - 1 - y;
    for (let x = 0; x < width; x += 1) {
      const index = pixelOffset + sourceY * stride + x * channels;
      if (index + 2 >= bytes.length) return null;
      const to = (y * width + x) * 4;
      rgba[to] = bytes[index + 2];
      rgba[to + 1] = bytes[index + 1];
      rgba[to + 2] = bytes[index];
      rgba[to + 3] = bpp === 32 ? bytes[index + 3] : 255;
    }
  }
  return { width, height, rgba };
}

async function decodeTiff(bytes: Uint8Array): Promise<Rgba> {
  const mod = (await import("utif")) as {
    decode?: (buffer: ArrayBuffer) => Array<{ width: number; height: number }>;
    decodeImage?: (buffer: ArrayBuffer, image: object) => void;
    toRGBA8?: (image: object) => Uint8Array;
    default?: {
      decode: (buffer: ArrayBuffer) => Array<{ width: number; height: number }>;
      decodeImage: (buffer: ArrayBuffer, image: object) => void;
      toRGBA8: (image: object) => Uint8Array;
    };
  };
  const utif = mod.decode ? mod : mod.default;
  if (!utif?.decode || !utif.decodeImage || !utif.toRGBA8) throw new Error("tiff");
  const buffer = bufferCopy(bytes);
  const pages = utif.decode(buffer);
  const page = pages[0];
  if (!page) throw new Error("tiff");
  utif.decodeImage(buffer, page);
  const width = page.width;
  const height = page.height;
  if (!width || !height) throw new Error("tiff");
  const rgba = utif.toRGBA8(page);
  return { width, height, rgba: new Uint8ClampedArray(rgba) };
}

async function decodeHeic(bytes: Uint8Array): Promise<Rgba> {
  const mod = (await import("heic-decode")) as {
    default?: (input: { buffer: ArrayBuffer }) => Promise<{ width: number; height: number; data: Uint8Array }>;
  };
  const decode = mod.default;
  if (!decode) throw new Error("heic");
  const buffer = bufferCopy(bytes);
  const decoded = await decode({ buffer });
  if (!decoded.width || !decoded.height) throw new Error("heic");
  return {
    width: decoded.width,
    height: decoded.height,
    rgba: decoded.data instanceof Uint8ClampedArray ? decoded.data : new Uint8ClampedArray(decoded.data),
  };
}

function sizedSvg(bytes: Uint8Array): Uint8Array {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (/<svg[^>]*\swidth=/i.test(text) && /<svg[^>]*\sheight=/i.test(text)) return bytes;
  const box = /viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
  const width = box ? Math.max(1, Math.round(Number(box[1]))) : 1024;
  const height = box ? Math.max(1, Math.round(Number(box[2]))) : 1024;
  const next = text.replace(/<svg/i, `<svg width="${width}" height="${height}"`);
  return new TextEncoder().encode(next);
}

export async function readFrame(file: File): Promise<FrameFile> {
  if (file.size < 16) throw new Error("Файл пустой или слишком маленький.");
  if (file.size > 25_000_000) throw new Error("Файл больше 25 МБ. Сожмите его и попробуйте снова.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = file.name || "кадр";
  let mime = sniffMime(bytes, name);
  const ext = extensionOf(name);
  if (!mime && (ext === "jpg" || ext === "jpeg" || ext === "jpe" || ext === "jfif")) {
    const sliced = jpegSlice(bytes);
    if (sliced) {
      mime = "image/jpeg";
      return finish(sliced, "image/jpeg", name);
    }
  }
  if (!mime && file.type.startsWith("image/")) mime = file.type.split(";")[0].trim().toLowerCase();
  if (!mime) {
    throw new Error("Этот файл не похож на изображение. Подойдут JPG, PNG, GIF, WebP, BMP, AVIF, TIFF, HEIC и SVG.");
  }
  return finish(bytes, mime, name);
}

async function finish(bytes: Uint8Array, mime: string, name: string): Promise<FrameFile> {
  if (mime === "image/tiff") {
    try {
      return paintRgba(await decodeTiff(bytes), name);
    } catch {
      throw new Error("Не удалось открыть этот TIFF.");
    }
  }
  if (mime === "image/heic" || mime === "image/heif") {
    const native = (await tryBlob(bytes, mime)) ?? (await tryBlob(bytes, "image/heic"));
    if (native) return paint(native, native.naturalWidth, native.naturalHeight, name);
    try {
      return paintRgba(await decodeHeic(bytes), name);
    } catch {
      throw new Error("Не удалось открыть этот HEIC. Сохраните копию как JPG, если телефон не отдал обычное фото.");
    }
  }
  if (mime === "image/svg+xml") {
    const svg = sizedSvg(bytes);
    const image = await tryBlob(svg, "image/svg+xml");
    if (image) return paint(image, image.naturalWidth, image.naturalHeight, name);
  }
  const types =
    mime === "image/bmp"
      ? ["image/bmp", "image/x-ms-bmp"]
      : mime === "image/x-icon"
        ? ["image/x-icon", "image/vnd.microsoft.icon", "image/png"]
        : [mime];
  for (const type of types) {
    const image = await tryBlob(bytes, type);
    if (image) return paint(image, image.naturalWidth, image.naturalHeight, name);
  }
  if (mime === "image/jpeg") {
    try {
      return paintRgba(await decodeJpeg(jpegSlice(bytes) ?? bytes), name);
    } catch {
      throw new Error("Не удалось открыть этот JPEG. Файл повреждён или это не фото.");
    }
  }
  if (mime === "image/bmp") {
    const bmp = decodeBmp(bytes);
    if (bmp) return paintRgba(bmp, name);
  }
  const plain = await tryBlob(bytes, "");
  if (plain) return paint(plain, plain.naturalWidth, plain.naturalHeight, name);
  throw new Error("Не удалось открыть этот файл. Подойдут JPG, PNG, GIF, WebP, BMP, AVIF, TIFF, HEIC и SVG.");
}
