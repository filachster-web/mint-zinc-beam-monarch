import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cl3wGtXv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var plate_default = "<div class=\"plate-app\">\n  <div class=\"plate-bar\"></div>\n  <main class=\"plate-main\">\n    <header class=\"plate-head\">\n      <div>\n        <p class=\"plate-kicker\">Студия кадра</p>\n        <h1>Twinplate</h1>\n        <p class=\"plate-lead\">\n          Одно фото — описание и два промпта на английском. Длину каждого текста можно задать от 1000 до 4000\n          знаков и добавить свои подробности.\n        </p>\n      </div>\n      <p class=\"plate-note\">Кадр уходит только в запрос и не хранится на сервере. История остаётся в этом браузере.</p>\n    </header>\n\n    <div class=\"plate-grid\">\n      <section class=\"plate-side\">\n        <label class=\"plate-drop\" id=\"plate-drop\">\n          <input\n            id=\"plate-file\"\n            type=\"file\"\n            accept=\"image/*,.jpg,.jpeg,.jpe,.jfif,.png,.gif,.webp,.bmp,.avif,.tif,.tiff,.heic,.heif,.svg,.ico\"\n          />\n          <span class=\"plate-drop-empty\" id=\"plate-empty\">\n            <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 5v10M7 10l5-5 5 5M5 19h14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>\n            <span class=\"plate-drop-title\">Положите кадр</span>\n            <span>JPG, JPEG, PNG, GIF, WebP, BMP, AVIF, TIFF, HEIC или SVG. Можно вставить из буфера.</span>\n          </span>\n          <img id=\"plate-preview\" alt=\"\" hidden />\n        </label>\n        <p class=\"plate-meta\" id=\"plate-meta\" hidden>\n          <span id=\"plate-name\"></span>\n          <span id=\"plate-size\"></span>\n        </p>\n\n        <div class=\"plate-card\">\n          <label class=\"plate-field\" for=\"plate-notes\">\n            <span>Подробности</span>\n            <textarea id=\"plate-notes\" maxlength=\"1200\" rows=\"4\" placeholder=\"Что вплести в описание и оба промпта: плёнка, свет, настроение, акцент.\"></textarea>\n            <span class=\"plate-count\" id=\"plate-notes-count\">0 / 1200</span>\n          </label>\n          <label class=\"plate-field\" for=\"plate-desc-len\">\n            <span>Длина описания <b id=\"plate-desc-val\">2500</b></span>\n            <input id=\"plate-desc-len\" type=\"range\" min=\"1000\" max=\"4000\" step=\"50\" value=\"2500\" />\n          </label>\n          <label class=\"plate-field\" for=\"plate-prompt-len\">\n            <span>Длина каждого промпта <b id=\"plate-prompt-val\">2000</b></span>\n            <input id=\"plate-prompt-len\" type=\"range\" min=\"1000\" max=\"4000\" step=\"50\" value=\"2000\" />\n          </label>\n          <p class=\"plate-hint\">Это потолок. Текст стремится к выбранному числу знаков и не превышает его.</p>\n        </div>\n\n        <div class=\"plate-actions\">\n          <button id=\"plate-go\" type=\"button\" class=\"plate-primary\" disabled>Описать и написать промпты</button>\n          <button id=\"plate-another\" type=\"button\" class=\"plate-ghost\">Другой файл</button>\n        </div>\n        <p id=\"plate-error\" class=\"plate-error\" role=\"alert\" hidden></p>\n        <p class=\"plate-hint\">Промпты описывают кадр прямо, без команд обходить правила модели.</p>\n      </section>\n\n      <section class=\"plate-out\" aria-live=\"polite\">\n        <div id=\"plate-idle\" class=\"plate-card\">\n          <p class=\"plate-kicker\">Два слепка</p>\n          <h2>Сначала факты кадра, потом два разных текста</h2>\n          <p class=\"plate-lead\">\n            Первый промпт звучит как отчёт оператора. Второй — как редакционная заметка. Оба держат тот же сюжет,\n            свет, кроп и пропорции и просят фотореализм 8K.\n          </p>\n          <ol class=\"plate-steps\">\n            <li><span>01</span>Кадр</li>\n            <li><span>02</span>Описание</li>\n            <li><span>03</span>Два промпта</li>\n          </ol>\n        </div>\n        <div id=\"plate-result\" hidden>\n          <div class=\"plate-result-bar\">\n            <p id=\"plate-result-count\" class=\"plate-hint\"></p>\n            <div class=\"plate-actions\">\n              <button id=\"plate-copy-all\" type=\"button\" class=\"plate-ghost\">Всё</button>\n              <button id=\"plate-download\" type=\"button\" class=\"plate-ghost\">Файл</button>\n            </div>\n          </div>\n          <article class=\"plate-sheet\" data-key=\"description\">\n            <header><p class=\"plate-kicker\">Description</p><h3>Описание</h3><button type=\"button\" data-copy=\"description\">Копировать</button></header>\n            <p class=\"plate-body\" id=\"plate-description\"></p>\n          </article>\n          <article class=\"plate-sheet\" data-key=\"a\">\n            <header><p class=\"plate-kicker\">Prompt A</p><h3>Технический</h3><button type=\"button\" data-copy=\"a\">Копировать</button></header>\n            <p class=\"plate-body\" id=\"plate-prompt-a\"></p>\n          </article>\n          <article class=\"plate-sheet\" data-key=\"b\">\n            <header><p class=\"plate-kicker\">Prompt B</p><h3>Сенсорный</h3><button type=\"button\" data-copy=\"b\">Копировать</button></header>\n            <p class=\"plate-body\" id=\"plate-prompt-b\"></p>\n          </article>\n        </div>\n      </section>\n    </div>\n\n    <section id=\"plate-history\" class=\"plate-history\" hidden>\n      <h2>Недавние</h2>\n      <ul id=\"plate-history-list\"></ul>\n    </section>\n  </main>\n</div>\n";
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var LENGTH_MIN = 1e3;
var LENGTH_MAX = 4e3;
var NOTES_MAX$1 = 1200;
var IMAGE_MAX_CHARS = 65e5;
function asInput(value) {
	if (!value || typeof value !== "object") throw new Error("Нужна фотография.");
	const raw = value;
	const image = raw.image;
	const width = raw.width;
	const height = raw.height;
	const aspect = raw.aspect;
	if (typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,")) throw new Error("Нужен кадр в JPEG.");
	if (image.length > IMAGE_MAX_CHARS) throw new Error("Файл слишком большой. Возьмите фото поменьше.");
	if (typeof width !== "number" || typeof height !== "number" || !Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 2e4 || height > 2e4) throw new Error("Не удалось прочитать размер кадра.");
	if (typeof aspect !== "string" || !/^\d{1,2}:\d{1,2}$/.test(aspect)) throw new Error("Не удалось прочитать пропорции кадра.");
	const descriptionLength = lengthOf(raw.descriptionLength);
	const promptLength = lengthOf(raw.promptLength);
	const notes = cleanNotes(raw.notes);
	return {
		image,
		width: Math.round(width),
		height: Math.round(height),
		aspect,
		notes,
		descriptionLength,
		promptLength
	};
}
function lengthOf(value) {
	const number = typeof value === "number" ? value : NaN;
	if (!Number.isFinite(number)) throw new Error("Укажите длину от 1000 до 4000 знаков.");
	const rounded = Math.round(number);
	if (rounded < LENGTH_MIN || rounded > LENGTH_MAX) throw new Error("Длина должна быть от 1000 до 4000 знаков.");
	return rounded;
}
function cleanNotes(value) {
	if (typeof value !== "string") return "";
	return value.replace(/\s+/g, " ").trim().slice(0, NOTES_MAX$1);
}
var describePhoto = createServerFn({ method: "POST" }).validator(asInput).handler(createSsrRpc("c78f6dcca53bce3b3141ef0a00c5378b7155bac01b501ed77b6e8eb9e5b5e70a"));
var RATIOS = [
	[1, 1],
	[4, 5],
	[3, 4],
	[2, 3],
	[9, 16],
	[5, 4],
	[4, 3],
	[3, 2],
	[16, 9],
	[21, 9]
];
var EXT_MIME = {
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
	heif: "image/heif"
};
function extensionOf(name) {
	const match = /\.([a-z0-9]+)$/i.exec(name.trim());
	return match ? match[1].toLowerCase() : "";
}
function ascii(bytes, start, length) {
	let text = "";
	for (let index = 0; index < length && start + index < bytes.length; index += 1) text += String.fromCharCode(bytes[start + index]);
	return text.toLowerCase();
}
function sniffMime(bytes, name) {
	if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
	if (bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return "image/png";
	if (bytes.length >= 6 && bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) return "image/gif";
	if (bytes.length >= 12 && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && ascii(bytes, 8, 4) === "webp") return "image/webp";
	if (bytes.length >= 2 && bytes[0] === 66 && bytes[1] === 77) return "image/bmp";
	if (bytes.length >= 4 && (bytes[0] === 73 && bytes[1] === 73 && bytes[2] === 42 && bytes[3] === 0 || bytes[0] === 77 && bytes[1] === 77 && bytes[2] === 0 && bytes[3] === 42)) return "image/tiff";
	if (bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return "image/x-icon";
	if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
		const brand = ascii(bytes, 8, 4);
		if (brand === "avif" || brand === "avis") return "image/avif";
		if (brand.startsWith("hei") || brand === "mif1" || brand === "msf1") return "image/heic";
	}
	const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 240)).trimStart().toLowerCase();
	if (head.startsWith("<svg") || head.startsWith("<?xml") && head.includes("<svg")) return "image/svg+xml";
	return EXT_MIME[extensionOf(name)] ?? null;
}
function nearestAspect(width, height) {
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
function loadImageElement(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			if (image.naturalWidth > 0 && image.naturalHeight > 0) resolve(image);
			else reject(/* @__PURE__ */ new Error("empty"));
		};
		image.onerror = () => reject(/* @__PURE__ */ new Error("error"));
		image.src = src;
	});
}
async function imageFromBlob(blob) {
	const url = URL.createObjectURL(blob);
	try {
		return await loadImageElement(url);
	} finally {
		URL.revokeObjectURL(url);
	}
}
function paint(source, sourceWidth, sourceHeight, name) {
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
	const image = canvas.toDataURL("image/jpeg", .86);
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
		thumb: thumbCanvas.toDataURL("image/jpeg", .72),
		image,
		width: sourceWidth,
		height: sourceHeight,
		aspect: nearestAspect(sourceWidth, sourceHeight)
	};
}
function bytesCopy(bytes) {
	const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
	copy.set(bytes);
	return copy;
}
function bufferCopy(bytes) {
	return bytesCopy(bytes).buffer;
}
function paintRgba(frame, name) {
	const scale = Math.min(1, 1536 / Math.max(frame.width, frame.height));
	const width = Math.max(1, Math.round(frame.width * scale));
	const height = Math.max(1, Math.round(frame.height * scale));
	const raw = width === frame.width && height === frame.height ? frame.rgba : downsample(frame.rgba, frame.width, frame.height, width, height);
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
function downsample(src, sourceWidth, sourceHeight, width, height) {
	const pixels = new Uint8ClampedArray(width * height * 4);
	for (let y = 0; y < height; y += 1) {
		const sourceY = Math.min(sourceHeight - 1, Math.floor(y * sourceHeight / height));
		for (let x = 0; x < width; x += 1) {
			const sourceX = Math.min(sourceWidth - 1, Math.floor(x * sourceWidth / width));
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
async function tryBlob(bytes, type) {
	try {
		return await imageFromBlob(new Blob([bytesCopy(bytes)], { type }));
	} catch {
		return null;
	}
}
function jpegSlice(bytes) {
	const limit = Math.min(bytes.length - 2, 65536);
	for (let index = 0; index < limit; index += 1) if (bytes[index] === 255 && bytes[index + 1] === 216 && bytes[index + 2] === 255) return index === 0 ? bytes : bytes.subarray(index);
	return null;
}
async function decodeJpeg(bytes) {
	const mod = await import("../_libs/jpeg-js.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const decode = mod.decode ?? mod.default?.decode;
	if (!decode) throw new Error("jpeg");
	const decoded = decode(bytes, {
		useTArray: true,
		formatAsRGBA: true,
		tolerantDecoding: true,
		maxResolutionInMP: 40
	});
	if (!decoded.width || !decoded.height || decoded.data.length < decoded.width * decoded.height * 4) throw new Error("jpeg");
	return {
		width: decoded.width,
		height: decoded.height,
		rgba: decoded.data instanceof Uint8ClampedArray ? decoded.data : new Uint8ClampedArray(decoded.data)
	};
}
function decodeBmp(bytes) {
	if (bytes.length < 54 || bytes[0] !== 66 || bytes[1] !== 77) return null;
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	const pixelOffset = view.getUint32(10, true);
	if (view.getUint32(14, true) < 40) return null;
	const width = view.getInt32(18, true);
	let height = view.getInt32(22, true);
	const topDown = height < 0;
	height = Math.abs(height);
	const bpp = view.getUint16(28, true);
	const compression = view.getUint32(30, true);
	if (width < 1 || height < 1 || width > 16e3 || height > 16e3) return null;
	if (compression !== 0 || bpp !== 24 && bpp !== 32) return null;
	const rgba = new Uint8ClampedArray(width * height * 4);
	const stride = Math.ceil(bpp * width / 32) * 4;
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
	return {
		width,
		height,
		rgba
	};
}
async function decodeTiff(bytes) {
	const mod = await import("../_libs/utif.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	const utif = mod.decode ? mod : mod.default;
	if (!utif?.decode || !utif.decodeImage || !utif.toRGBA8) throw new Error("tiff");
	const buffer = bufferCopy(bytes);
	const page = utif.decode(buffer)[0];
	if (!page) throw new Error("tiff");
	utif.decodeImage(buffer, page);
	const width = page.width;
	const height = page.height;
	if (!width || !height) throw new Error("tiff");
	const rgba = utif.toRGBA8(page);
	return {
		width,
		height,
		rgba: new Uint8ClampedArray(rgba)
	};
}
async function decodeHeic(bytes) {
	const decode = (await import("../_libs/heic-decode+libheif-js.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default;
	if (!decode) throw new Error("heic");
	const decoded = await decode({ buffer: bufferCopy(bytes) });
	if (!decoded.width || !decoded.height) throw new Error("heic");
	return {
		width: decoded.width,
		height: decoded.height,
		rgba: decoded.data instanceof Uint8ClampedArray ? decoded.data : new Uint8ClampedArray(decoded.data)
	};
}
function sizedSvg(bytes) {
	const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
	if (/<svg[^>]*\swidth=/i.test(text) && /<svg[^>]*\sheight=/i.test(text)) return bytes;
	const box = /viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
	const width = box ? Math.max(1, Math.round(Number(box[1]))) : 1024;
	const height = box ? Math.max(1, Math.round(Number(box[2]))) : 1024;
	const next = text.replace(/<svg/i, `<svg width="${width}" height="${height}"`);
	return new TextEncoder().encode(next);
}
async function readFrame(file) {
	if (file.size < 16) throw new Error("Файл пустой или слишком маленький.");
	if (file.size > 25e6) throw new Error("Файл больше 25 МБ. Сожмите его и попробуйте снова.");
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
	if (!mime) throw new Error("Этот файл не похож на изображение. Подойдут JPG, PNG, GIF, WebP, BMP, AVIF, TIFF, HEIC и SVG.");
	return finish(bytes, mime, name);
}
async function finish(bytes, mime, name) {
	if (mime === "image/tiff") try {
		return paintRgba(await decodeTiff(bytes), name);
	} catch {
		throw new Error("Не удалось открыть этот TIFF.");
	}
	if (mime === "image/heic" || mime === "image/heif") {
		const native = await tryBlob(bytes, mime) ?? await tryBlob(bytes, "image/heic");
		if (native) return paint(native, native.naturalWidth, native.naturalHeight, name);
		try {
			return paintRgba(await decodeHeic(bytes), name);
		} catch {
			throw new Error("Не удалось открыть этот HEIC. Сохраните копию как JPG, если телефон не отдал обычное фото.");
		}
	}
	if (mime === "image/svg+xml") {
		const image = await tryBlob(sizedSvg(bytes), "image/svg+xml");
		if (image) return paint(image, image.naturalWidth, image.naturalHeight, name);
	}
	const types = mime === "image/bmp" ? ["image/bmp", "image/x-ms-bmp"] : mime === "image/x-icon" ? [
		"image/x-icon",
		"image/vnd.microsoft.icon",
		"image/png"
	] : [mime];
	for (const type of types) {
		const image = await tryBlob(bytes, type);
		if (image) return paint(image, image.naturalWidth, image.naturalHeight, name);
	}
	if (mime === "image/jpeg") try {
		return paintRgba(await decodeJpeg(jpegSlice(bytes) ?? bytes), name);
	} catch {
		throw new Error("Не удалось открыть этот JPEG. Файл повреждён или это не фото.");
	}
	if (mime === "image/bmp") {
		const bmp = decodeBmp(bytes);
		if (bmp) return paintRgba(bmp, name);
	}
	const plain = await tryBlob(bytes, "");
	if (plain) return paint(plain, plain.naturalWidth, plain.naturalHeight, name);
	throw new Error("Не удалось открыть этот файл. Подойдут JPG, PNG, GIF, WebP, BMP, AVIF, TIFF, HEIC и SVG.");
}
var HISTORY_KEY = "twinplate-history-v1";
var HISTORY_LIMIT = 6;
var NOTES_MAX = 1200;
function loadHistory() {
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item) => item && typeof item.description === "string").slice(0, HISTORY_LIMIT);
	} catch {
		return [];
	}
}
function saveHistory(items) {
	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
	} catch {}
}
async function copyText(value) {
	try {
		await navigator.clipboard.writeText(value);
	} catch {
		const area = document.createElement("textarea");
		area.value = value;
		area.setAttribute("readonly", "true");
		document.body.appendChild(area);
		area.select();
		document.execCommand("copy");
		area.remove();
	}
}
function bundleOf(result) {
	return [
		"DESCRIPTION",
		result.description,
		"",
		"PROMPT A",
		result.promptA,
		"",
		"PROMPT B",
		result.promptB,
		""
	].join("\n");
}
function bindPlate(root) {
	const $ = (selector) => {
		const node = root.querySelector(selector);
		if (!node) throw new Error(`Не найдено ${selector}`);
		return node;
	};
	const drop = $("#plate-drop");
	const fileInput = $("#plate-file");
	const empty = $("#plate-empty");
	const preview = $("#plate-preview");
	const meta = $("#plate-meta");
	const nameEl = $("#plate-name");
	const sizeEl = $("#plate-size");
	const notes = $("#plate-notes");
	const notesCount = $("#plate-notes-count");
	const descRange = $("#plate-desc-len");
	const promptRange = $("#plate-prompt-len");
	const descVal = $("#plate-desc-val");
	const promptVal = $("#plate-prompt-val");
	const go = $("#plate-go");
	const another = $("#plate-another");
	const errorEl = $("#plate-error");
	const idle = $("#plate-idle");
	const resultBox = $("#plate-result");
	const resultCount = $("#plate-result-count");
	const descriptionEl = $("#plate-description");
	const promptAEl = $("#plate-prompt-a");
	const promptBEl = $("#plate-prompt-b");
	const historyBlock = $("#plate-history");
	const historyList = $("#plate-history-list");
	let plate = null;
	let result = null;
	let busy = false;
	let timer = 0;
	let copied = "";
	function showError(message) {
		errorEl.hidden = !message;
		errorEl.textContent = message;
	}
	function renderHistory() {
		const items = loadHistory();
		historyList.replaceChildren();
		historyBlock.hidden = items.length === 0;
		for (const item of items) {
			const li = document.createElement("li");
			const open = document.createElement("button");
			open.type = "button";
			open.className = "plate-history-open";
			const img = document.createElement("img");
			img.src = item.thumb;
			img.alt = "";
			const text = document.createElement("span");
			text.textContent = item.name || "кадр";
			open.append(img, text);
			open.addEventListener("click", () => {
				result = item;
				plate = null;
				preview.hidden = !item.thumb;
				if (item.thumb) preview.src = item.thumb;
				empty.hidden = Boolean(item.thumb);
				meta.hidden = false;
				nameEl.textContent = item.name;
				sizeEl.textContent = item.aspect;
				go.disabled = true;
				showError("");
				renderResult();
			});
			const remove = document.createElement("button");
			remove.type = "button";
			remove.className = "plate-history-remove";
			remove.textContent = "Убрать";
			remove.addEventListener("click", () => {
				saveHistory(loadHistory().filter((entry) => entry.id !== item.id));
				renderHistory();
			});
			li.append(open, remove);
			historyList.append(li);
		}
	}
	function renderResult() {
		const has = Boolean(result);
		idle.hidden = has;
		resultBox.hidden = !has;
		if (!result) return;
		descriptionEl.textContent = result.description;
		promptAEl.textContent = result.promptA;
		promptBEl.textContent = result.promptB;
		const target = result.descriptionTarget ? ` / ${result.descriptionTarget}` : "";
		resultCount.textContent = `Описание ${result.description.length}${target}`;
		root.querySelectorAll("[data-copy]").forEach((button) => {
			const key = button.dataset.copy || "";
			button.textContent = copied === key ? "Скопировано" : "Копировать";
		});
		const all = $("#plate-copy-all");
		all.textContent = copied === "all" ? "Скопировано" : "Всё";
	}
	async function takeFile(file) {
		if (!file || busy) return;
		showError("");
		go.disabled = true;
		go.textContent = "Открываю кадр";
		try {
			plate = await readFrame(file);
			preview.src = plate.previewUrl;
			preview.hidden = false;
			empty.hidden = true;
			meta.hidden = false;
			nameEl.textContent = plate.fileName;
			sizeEl.textContent = `${plate.width}×${plate.height} · ${plate.aspect}`;
			result = null;
			renderResult();
			go.disabled = false;
		} catch (reason) {
			plate = null;
			preview.hidden = true;
			preview.removeAttribute("src");
			empty.hidden = false;
			meta.hidden = true;
			go.disabled = true;
			showError(reason instanceof Error ? reason.message : "Не удалось открыть файл.");
		} finally {
			if (!busy) go.textContent = "Описать и написать промпты";
		}
	}
	async function onDescribe() {
		if (!plate || busy) return;
		busy = true;
		go.disabled = true;
		showError("");
		const started = Date.now();
		const tick = () => {
			go.textContent = `Смотрю кадр · ${Math.floor((Date.now() - started) / 1e3)} с`;
		};
		tick();
		timer = window.setInterval(tick, 250);
		try {
			const response = await describePhoto({ data: {
				image: plate.image,
				width: plate.width,
				height: plate.height,
				aspect: plate.aspect,
				notes: notes.value,
				descriptionLength: Number(descRange.value),
				promptLength: Number(promptRange.value)
			} });
			if (!response.ok) {
				showError(response.error);
				return;
			}
			result = response;
			renderResult();
			const item = {
				id: `${Date.now()}`,
				at: Date.now(),
				name: plate.fileName,
				thumb: plate.thumb,
				aspect: plate.aspect,
				description: response.description,
				promptA: response.promptA,
				promptB: response.promptB,
				descriptionTarget: response.descriptionTarget,
				promptTarget: response.promptTarget
			};
			saveHistory([item, ...loadHistory().filter((entry) => entry.id !== item.id)].slice(0, HISTORY_LIMIT));
			renderHistory();
		} catch (reason) {
			showError(reason instanceof Error ? reason.message : "Не удалось отправить кадр.");
		} finally {
			window.clearInterval(timer);
			busy = false;
			go.disabled = !plate;
			go.textContent = "Описать и написать промпты";
		}
	}
	function flash(key) {
		copied = key;
		renderResult();
		window.setTimeout(() => {
			if (copied === key) {
				copied = "";
				renderResult();
			}
		}, 1600);
	}
	const onNotes = () => {
		notesCount.textContent = `${notes.value.trim().length} / ${NOTES_MAX}`;
	};
	const onDesc = () => {
		descVal.textContent = descRange.value;
	};
	const onPrompt = () => {
		promptVal.textContent = promptRange.value;
	};
	const onFile = () => {
		takeFile(fileInput.files?.[0]);
		fileInput.value = "";
	};
	const onDragOver = (event) => {
		event.preventDefault();
		drop.classList.add("is-over");
	};
	const onDragLeave = () => drop.classList.remove("is-over");
	const onDrop = (event) => {
		event.preventDefault();
		drop.classList.remove("is-over");
		takeFile(event.dataTransfer?.files?.[0]);
	};
	const onPaste = (event) => {
		const files = event.clipboardData?.files;
		if (!files || files.length === 0) return;
		const file = files[0];
		if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp|bmp|avif|tiff?|heic|heif|svg|ico)$/i.test(file.name)) return;
		event.preventDefault();
		takeFile(file);
	};
	const onCopyClick = (event) => {
		const button = event.target?.closest("button");
		if (!button || !result) return;
		const key = button.dataset.copy;
		if (!key) return;
		copyText(key === "description" ? result.description : key === "a" ? result.promptA : result.promptB).then(() => flash(key));
	};
	const onCopyAll = () => {
		if (!result) return;
		copyText(bundleOf(result)).then(() => flash("all"));
	};
	const onDownload = () => {
		if (!result) return;
		const blob = new Blob([bundleOf(result)], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "twinplate.txt";
		link.click();
		URL.revokeObjectURL(url);
	};
	notes.addEventListener("input", onNotes);
	descRange.addEventListener("input", onDesc);
	promptRange.addEventListener("input", onPrompt);
	fileInput.addEventListener("change", onFile);
	drop.addEventListener("dragover", onDragOver);
	drop.addEventListener("dragleave", onDragLeave);
	drop.addEventListener("drop", onDrop);
	another.addEventListener("click", () => fileInput.click());
	go.addEventListener("click", () => void onDescribe());
	$("#plate-copy-all").addEventListener("click", onCopyAll);
	$("#plate-download").addEventListener("click", onDownload);
	resultBox.addEventListener("click", onCopyClick);
	document.addEventListener("paste", onPaste);
	onNotes();
	onDesc();
	onPrompt();
	renderHistory();
	return () => {
		window.clearInterval(timer);
		notes.removeEventListener("input", onNotes);
		descRange.removeEventListener("input", onDesc);
		promptRange.removeEventListener("input", onPrompt);
		fileInput.removeEventListener("change", onFile);
		drop.removeEventListener("dragover", onDragOver);
		drop.removeEventListener("dragleave", onDragLeave);
		drop.removeEventListener("drop", onDrop);
		document.removeEventListener("paste", onPaste);
	};
}
function Home() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const node = ref.current;
		if (!node) return;
		return bindPlate(node);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		dangerouslySetInnerHTML: { __html: plate_default }
	});
}
//#endregion
export { Home as component };
