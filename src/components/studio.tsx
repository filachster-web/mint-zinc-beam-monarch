import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, ImagePlus, Trash2 } from "lucide-react";
import { describePhoto, type PlateResult } from "@/lib/describe.functions";

const HISTORY_KEY = "twinplate-history-v1";
const HISTORY_LIMIT = 6;

type Plate = {
  fileName: string;
  previewUrl: string;
  thumb: string;
  image: string;
  width: number;
  height: number;
  aspect: string;
};

type HistoryItem = PlateResult & {
  id: string;
  at: number;
  name: string;
  thumb: string;
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

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.description === "string").slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
  } catch {
    /* private mode or quota */
  }
}

async function readPlate(file: File): Promise<Plate> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Нужен файл изображения — JPG, PNG или WebP.");
  }
  if (file.size > 25_000_000) {
    throw new Error("Файл больше 25 МБ. Сожмите его и попробуйте снова.");
  }
  let bitmap: ImageBitmap;
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
  const image = canvas.toDataURL("image/jpeg", 0.82);
  const thumbCanvas = document.createElement("canvas");
  const thumbScale = Math.min(1, 160 / Math.max(targetW, targetH));
  thumbCanvas.width = Math.max(1, Math.round(targetW * thumbScale));
  thumbCanvas.height = Math.max(1, Math.round(targetH * thumbScale));
  const thumbContext = thumbCanvas.getContext("2d");
  if (!thumbContext) throw new Error("Не удалось подготовить кадр.");
  thumbContext.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const thumb = thumbCanvas.toDataURL("image/jpeg", 0.72);
  return {
    fileName: file.name || "кадр",
    previewUrl: image,
    thumb,
    image,
    width,
    height,
    aspect: nearestAspect(width, height),
  };
}

async function copyText(value: string) {
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

function formatWhen(stamp: number): string {
  return new Intl.DateTimeFormat("ru", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(stamp);
}

export function Studio() {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [plate, setPlate] = useState<Plate | null>(null);
  const [result, setResult] = useState<PlateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [busy]);

  const bundle = useMemo(() => {
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
      "",
    ].join("\n");
  }, [result]);

  async function takeFile(file: File | undefined) {
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
      const response = await describePhoto({
        data: {
          image: plate.image,
          width: plate.width,
          height: plate.height,
          aspect: plate.aspect,
        },
      });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      const next: PlateResult = {
        description: response.description,
        promptA: response.promptA,
        promptB: response.promptB,
      };
      setResult(next);
      const item: HistoryItem = {
        ...next,
        id: `${Date.now()}`,
        at: Date.now(),
        name: plate.fileName,
        thumb: plate.thumb,
        aspect: plate.aspect,
      };
      const stored = [item, ...loadHistory().filter((entry) => entry.name !== item.name || entry.at < item.at - 1000)].slice(
        0,
        HISTORY_LIMIT,
      );
      saveHistory(stored);
      setHistory(stored);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось отправить кадр.");
    } finally {
      setBusy(false);
    }
  }

  async function onCopy(key: string, value: string) {
    await copyText(value);
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
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

  function openHistory(item: HistoryItem) {
    setError(null);
    setResult({
      description: item.description,
      promptA: item.promptA,
      promptB: item.promptB,
    });
    setPlate({
      fileName: item.name,
      previewUrl: item.thumb,
      thumb: item.thumb,
      image: "",
      width: 0,
      height: 0,
      aspect: item.aspect,
    });
  }

  function removeHistory(id: string) {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    saveHistory(next);
  }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="h-1 bg-safelight" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-widest text-brass uppercase">Студия кадра</p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-balance text-paper sm:text-5xl">
              Twinplate
            </h1>
            <p className="mt-3 max-w-lg text-base leading-normal text-pretty text-brass">
              Одно фото — подробное описание на английском, не длиннее 4000 знаков, и два промпта разными
              словами для того же кадра в 8K.
            </p>
          </div>
          <p className="max-w-xs text-sm leading-normal text-brass">
            Кадр уходит только в запрос и не хранится на сервере. История остаётся в этом браузере.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <section className="flex flex-col gap-4 lg:sticky lg:top-6 lg:col-span-5">
            <label
              htmlFor={inputId}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                void takeFile(event.dataTransfer.files?.[0]);
              }}
              className={
                "relative flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border border-dashed bg-panel px-5 py-8 text-center " +
                (dragOver ? "border-safelight" : "border-rule")
              }
            >
              <input
                id={inputId}
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => {
                  void takeFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              {plate ? (
                <img
                  src={plate.previewUrl}
                  alt=""
                  className="max-h-80 w-full rounded-2xl object-contain"
                />
              ) : (
                <span className="flex flex-col items-center gap-3 text-brass">
                  <ImagePlus className="size-8" strokeWidth={1.5} aria-hidden="true" />
                  <span className="font-display text-2xl text-paper">Положите кадр</span>
                  <span className="max-w-xs text-sm leading-normal">
                    Или нажмите, чтобы выбрать JPG, PNG, WebP. Можно вставить из буфера.
                  </span>
                </span>
              )}
            </label>

            {plate ? (
              <div className="flex items-center justify-between gap-3 text-sm text-brass">
                <span className="truncate">{plate.fileName}</span>
                <span className="shrink-0 tabular-nums">
                  {plate.width > 0 ? `${plate.width}×${plate.height} · ${plate.aspect}` : plate.aspect}
                </span>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!plate || !plate.image || busy}
                onClick={() => void onDescribe()}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-safelight px-5 text-sm font-semibold text-safelight-ink disabled:opacity-40"
              >
                {busy ? <span className="plate-wait">Смотрю кадр · {seconds} с</span> : "Описать и написать промпты"}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex h-12 items-center justify-center rounded-full border border-rule bg-panel-2 px-5 text-sm font-medium text-paper"
              >
                Другой файл
              </button>
            </div>

            {error ? (
              <p role="alert" className="rounded-2xl border border-rule bg-panel px-4 py-3 text-sm leading-normal text-alert">
                {error}
              </p>
            ) : null}

            <p className="text-xs leading-normal text-brass">
              Промпты описывают кадр прямо. В них нет команд «игнорируй правила» — такие строки не делают копию
              точнее.
            </p>
          </section>

          <section className="flex flex-col gap-4 lg:col-span-7" aria-live="polite">
            {result ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-brass">
                    Описание{" "}
                    <span className="tabular-nums text-paper">{result.description.length}</span>
                    <span className="tabular-nums"> / 4000</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onCopy("all", bundle)}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-rule px-4 text-sm text-paper"
                    >
                      {copied === "all" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      Всё
                    </button>
                    <button
                      type="button"
                      onClick={onDownload}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-rule px-4 text-sm text-paper"
                    >
                      <Download className="size-4" />
                      Файл
                    </button>
                  </div>
                </div>
                <Sheet
                  kicker="Description"
                  title="Описание"
                  hint="Один плотный абзац по видимому кадру"
                  body={result.description}
                  copied={copied === "description"}
                  onCopy={() => void onCopy("description", result.description)}
                />
                <Sheet
                  kicker="Prompt A"
                  title="Технический"
                  hint="Язык камеры: оптика, свет, геометрия"
                  body={result.promptA}
                  copied={copied === "a"}
                  onCopy={() => void onCopy("a", result.promptA)}
                />
                <Sheet
                  kicker="Prompt B"
                  title="Сенсорный"
                  hint="Другие слова, те же факты кадра"
                  body={result.promptB}
                  copied={copied === "b"}
                  onCopy={() => void onCopy("b", result.promptB)}
                />
              </>
            ) : (
              <div className="flex flex-col rounded-card border border-rule bg-panel p-6">
                <div>
                  <p className="text-xs font-medium tracking-widest text-brass uppercase">Два слепка</p>
                  <h2 className="mt-3 font-display text-3xl leading-tight text-balance">
                    Сначала факты кадра, потом два разных текста
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-normal text-brass">
                    Первый промпт звучит как отчёт оператора. Второй — как редакционная заметка. Оба держат тот
                    же сюжет, свет, кроп и пропорции и просят фотореализм 8K.
                  </p>
                </div>
                <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
                  <Step n="01" label="Кадр" />
                  <Step n="02" label="Описание" />
                  <Step n="03" label="Два промпта" />
                </ol>
              </div>
            )}
          </section>
        </div>

        {mounted && history.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl">Недавние</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-2xl border border-rule bg-panel p-3">
                  <button type="button" onClick={() => openHistory(item)} className="flex min-w-0 flex-1 gap-3 text-left">
                    <img src={item.thumb} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-paper">{item.name}</span>
                      <span className="mt-1 block text-xs text-brass">
                        {formatWhen(item.at)} · {item.aspect}
                      </span>
                      <span className="mt-1 block text-xs tabular-nums text-brass">
                        {item.description.length} знаков
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Удалить ${item.name}`}
                    onClick={() => removeHistory(item.id)}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-brass"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <PasteCatcher
        onFile={(file) => {
          void takeFile(file);
        }}
      />
    </div>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <li className="rounded-2xl bg-panel-2 px-3 py-3">
      <span className="block font-display text-lg text-safelight tabular-nums">{n}</span>
      <span className="text-paper">{label}</span>
    </li>
  );
}

function Sheet({
  kicker,
  title,
  hint,
  body,
  copied,
  onCopy,
}: {
  kicker: string;
  title: string;
  hint: string;
  body: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="rounded-card border border-rule bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-safelight uppercase">{kicker}</p>
          <h2 className="mt-1 font-display text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-brass">{hint}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-panel-2 px-4 text-sm text-paper"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Готово" : "Копировать"}
        </button>
      </div>
      <p className="mt-4 max-h-80 overflow-y-auto text-sm leading-normal text-pretty text-paper">{body}</p>
      <p className="mt-3 text-xs tabular-nums text-brass">{body.length} знаков</p>
    </article>
  );
}

function PasteCatcher({ onFile }: { onFile: (file: File) => void }) {
  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
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
