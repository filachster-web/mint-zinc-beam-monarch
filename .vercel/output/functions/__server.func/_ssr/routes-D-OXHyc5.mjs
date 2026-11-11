import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as Copy, i as Download, n as Trash2, o as Check, r as ImagePlus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D-OXHyc5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	return {
		image,
		width: Math.round(width),
		height: Math.round(height),
		aspect
	};
}
var describePhoto = createServerFn({ method: "POST" }).validator(asInput).handler(createSsrRpc("c78f6dcca53bce3b3141ef0a00c5378b7155bac01b501ed77b6e8eb9e5b5e70a"));
var HISTORY_KEY = "twinplate-history-v1";
var HISTORY_LIMIT = 6;
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
async function readPlate(file) {
	if (!file.type.startsWith("image/")) throw new Error("Нужен файл изображения — JPG, PNG или WebP.");
	if (file.size > 25e6) throw new Error("Файл больше 25 МБ. Сожмите его и попробуйте снова.");
	let bitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		throw new Error("Этот формат браузер не открывает. Сохраните кадр как JPG или PNG.");
	}
	const width = bitmap.width;
	const height = bitmap.height;
	const scale = Math.min(1, 1536 / Math.max(width, height));
	const targetW = Math.max(1, Math.round(width * scale));
	const targetH = Math.max(1, Math.round(height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = targetW;
	canvas.height = targetH;
	const context = canvas.getContext("2d");
	if (!context) {
		bitmap.close();
		throw new Error("Не удалось подготовить кадр.");
	}
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, targetW, targetH);
	context.drawImage(bitmap, 0, 0, targetW, targetH);
	bitmap.close();
	const image = canvas.toDataURL("image/jpeg", .82);
	const thumbCanvas = document.createElement("canvas");
	const thumbScale = Math.min(1, 160 / Math.max(targetW, targetH));
	thumbCanvas.width = Math.max(1, Math.round(targetW * thumbScale));
	thumbCanvas.height = Math.max(1, Math.round(targetH * thumbScale));
	const thumbContext = thumbCanvas.getContext("2d");
	if (!thumbContext) throw new Error("Не удалось подготовить кадр.");
	thumbContext.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
	const thumb = thumbCanvas.toDataURL("image/jpeg", .72);
	return {
		fileName: file.name || "кадр",
		previewUrl: image,
		thumb,
		image,
		width,
		height,
		aspect: nearestAspect(width, height)
	};
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
function formatWhen(stamp) {
	return new Intl.DateTimeFormat("ru", {
		hour: "2-digit",
		minute: "2-digit",
		day: "numeric",
		month: "short"
	}).format(stamp);
}
function Studio() {
	const inputId = (0, import_react.useId)();
	const fileRef = (0, import_react.useRef)(null);
	const [plate, setPlate] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(null);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHistory(loadHistory());
		setMounted(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!busy) return;
		const started = Date.now();
		const timer = window.setInterval(() => {
			setSeconds(Math.floor((Date.now() - started) / 1e3));
		}, 250);
		return () => window.clearInterval(timer);
	}, [busy]);
	const bundle = (0, import_react.useMemo)(() => {
		if (!result) return "";
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
	}, [result]);
	async function takeFile(file) {
		if (!file) return;
		setError(null);
		setResult(null);
		try {
			setPlate(await readPlate(file));
		} catch (reason) {
			setPlate(null);
			setError(reason instanceof Error ? reason.message : "Не удалось открыть файл.");
		}
	}
	async function onDescribe() {
		if (!plate || busy) return;
		setBusy(true);
		setSeconds(0);
		setError(null);
		setResult(null);
		try {
			const response = await describePhoto({ data: {
				image: plate.image,
				width: plate.width,
				height: plate.height,
				aspect: plate.aspect
			} });
			if (!response.ok) {
				setError(response.error);
				return;
			}
			const next = {
				description: response.description,
				promptA: response.promptA,
				promptB: response.promptB
			};
			setResult(next);
			const item = {
				...next,
				id: `${Date.now()}`,
				at: Date.now(),
				name: plate.fileName,
				thumb: plate.thumb,
				aspect: plate.aspect
			};
			const stored = [item, ...loadHistory().filter((entry) => entry.name !== item.name || entry.at < item.at - 1e3)].slice(0, HISTORY_LIMIT);
			saveHistory(stored);
			setHistory(stored);
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : "Не удалось отправить кадр.");
		} finally {
			setBusy(false);
		}
	}
	async function onCopy(key, value) {
		await copyText(value);
		setCopied(key);
		window.setTimeout(() => setCopied((current) => current === key ? null : current), 1600);
	}
	function onDownload() {
		if (!bundle) return;
		const blob = new Blob([bundle], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "twinplate.txt";
		link.click();
		URL.revokeObjectURL(url);
	}
	function openHistory(item) {
		setError(null);
		setResult({
			description: item.description,
			promptA: item.promptA,
			promptB: item.promptB
		});
		setPlate({
			fileName: item.name,
			previewUrl: item.thumb,
			thumb: item.thumb,
			image: "",
			width: 0,
			height: 0,
			aspect: item.aspect
		});
	}
	function removeHistory(id) {
		const next = history.filter((item) => item.id !== id);
		setHistory(next);
		saveHistory(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-ink text-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-safelight" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-widest text-brass uppercase",
									children: "Студия кадра"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-2 font-display text-4xl leading-tight text-balance text-paper sm:text-5xl",
									children: "Twinplate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 max-w-lg text-base leading-normal text-pretty text-brass",
									children: "Одно фото — подробное описание на английском, не длиннее 4000 знаков, и два промпта разными словами для того же кадра в 8K."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-xs text-sm leading-normal text-brass",
							children: "Кадр уходит только в запрос и не хранится на сервере. История остаётся в этом браузере."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid items-start gap-6 lg:grid-cols-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "flex flex-col gap-4 lg:sticky lg:top-6 lg:col-span-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: inputId,
									onDragOver: (event) => {
										event.preventDefault();
										setDragOver(true);
									},
									onDragLeave: () => setDragOver(false),
									onDrop: (event) => {
										event.preventDefault();
										setDragOver(false);
										takeFile(event.dataTransfer.files?.[0]);
									},
									className: "relative flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border border-dashed bg-panel px-5 py-8 text-center " + (dragOver ? "border-safelight" : "border-rule"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: inputId,
										ref: fileRef,
										type: "file",
										accept: "image/jpeg,image/png,image/webp,image/gif",
										className: "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0",
										onChange: (event) => {
											takeFile(event.target.files?.[0]);
											event.target.value = "";
										}
									}), plate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: plate.previewUrl,
										alt: "",
										className: "max-h-80 w-full rounded-2xl object-contain"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-col items-center gap-3 text-brass",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
												className: "size-8",
												strokeWidth: 1.5,
												"aria-hidden": "true"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-2xl text-paper",
												children: "Положите кадр"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "max-w-xs text-sm leading-normal",
												children: "Или нажмите, чтобы выбрать JPG, PNG, WebP. Можно вставить из буфера."
											})
										]
									})]
								}),
								plate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 text-sm text-brass",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: plate.fileName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 tabular-nums",
										children: plate.width > 0 ? `${plate.width}×${plate.height} · ${plate.aspect}` : plate.aspect
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-3 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !plate || !plate.image || busy,
										onClick: () => void onDescribe(),
										className: "inline-flex h-12 flex-1 items-center justify-center rounded-full bg-safelight px-5 text-sm font-semibold text-safelight-ink disabled:opacity-40",
										children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "plate-wait",
											children: [
												"Смотрю кадр · ",
												seconds,
												" с"
											]
										}) : "Описать и написать промпты"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => fileRef.current?.click(),
										className: "inline-flex h-12 items-center justify-center rounded-full border border-rule bg-panel-2 px-5 text-sm font-medium text-paper",
										children: "Другой файл"
									})]
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "rounded-2xl border border-rule bg-panel px-4 py-3 text-sm leading-normal text-alert",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs leading-normal text-brass",
									children: "Промпты описывают кадр прямо. В них нет команд «игнорируй правила» — такие строки не делают копию точнее."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "flex flex-col gap-4 lg:col-span-7",
							"aria-live": "polite",
							children: result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-brass",
										children: [
											"Описание",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums text-paper",
												children: result.description.length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums",
												children: " / 4000"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void onCopy("all", bundle),
											className: "inline-flex h-11 items-center gap-2 rounded-full border border-rule px-4 text-sm text-paper",
											children: [copied === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Всё"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: onDownload,
											className: "inline-flex h-11 items-center gap-2 rounded-full border border-rule px-4 text-sm text-paper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Файл"]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
									kicker: "Description",
									title: "Описание",
									hint: "Один плотный абзац по видимому кадру",
									body: result.description,
									copied: copied === "description",
									onCopy: () => void onCopy("description", result.description)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
									kicker: "Prompt A",
									title: "Технический",
									hint: "Язык камеры: оптика, свет, геометрия",
									body: result.promptA,
									copied: copied === "a",
									onCopy: () => void onCopy("a", result.promptA)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
									kicker: "Prompt B",
									title: "Сенсорный",
									hint: "Другие слова, те же факты кадра",
									body: result.promptB,
									copied: copied === "b",
									onCopy: () => void onCopy("b", result.promptB)
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col rounded-card border border-rule bg-panel p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-widest text-brass uppercase",
										children: "Два слепка"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-display text-3xl leading-tight text-balance",
										children: "Сначала факты кадра, потом два разных текста"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 max-w-md text-sm leading-normal text-brass",
										children: "Первый промпт звучит как отчёт оператора. Второй — как редакционная заметка. Оба держат тот же сюжет, свет, кроп и пропорции и просят фотореализм 8K."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "mt-8 grid gap-3 text-sm sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
											n: "01",
											label: "Кадр"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
											n: "02",
											label: "Описание"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
											n: "03",
											label: "Два промпта"
										})
									]
								})]
							})
						})]
					}),
					mounted && history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Недавние"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: history.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3 rounded-2xl border border-rule bg-panel p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => openHistory(item),
								className: "flex min-w-0 flex-1 gap-3 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.thumb,
									alt: "",
									className: "size-16 shrink-0 rounded-xl object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm text-paper",
											children: item.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-xs text-brass",
											children: [
												formatWhen(item.at),
												" · ",
												item.aspect
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-xs tabular-nums text-brass",
											children: [item.description.length, " знаков"]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Удалить ${item.name}`,
								onClick: () => removeHistory(item.id),
								className: "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-brass",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, item.id))
					})] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasteCatcher, { onFile: (file) => {
				takeFile(file);
			} })
		]
	});
}
function Step({ n, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-2xl bg-panel-2 px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block font-display text-lg text-safelight tabular-nums",
			children: n
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-paper",
			children: label
		})]
	});
}
function Sheet({ kicker, title, hint, body, copied, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-card border border-rule bg-panel p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-safelight uppercase",
						children: kicker
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-brass",
						children: hint
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onCopy,
					className: "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-panel-2 px-4 text-sm text-paper",
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Готово" : "Копировать"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-h-80 overflow-y-auto text-sm leading-normal text-pretty text-paper",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs tabular-nums text-brass",
				children: [body.length, " знаков"]
			})
		]
	});
}
function PasteCatcher({ onFile }) {
	(0, import_react.useEffect)(() => {
		function onPaste(event) {
			const files = event.clipboardData?.files;
			if (!files || files.length === 0) return;
			const file = files[0];
			if (!file.type.startsWith("image/")) return;
			event.preventDefault();
			onFile(file);
		}
		window.addEventListener("paste", onPaste);
		return () => window.removeEventListener("paste", onPaste);
	}, [onFile]);
	return null;
}
var SplitComponent = Studio;
//#endregion
export { SplitComponent as component };
