import { describePhoto } from "@/lib/describe.functions";
import { readFrame, type FrameFile } from "@/open-image";

const HISTORY_KEY = "twinplate-history-v1";
const HISTORY_LIMIT = 6;
const NOTES_MAX = 1200;

type HistoryItem = {
  id: string;
  at: number;
  name: string;
  thumb: string;
  aspect: string;
  description: string;
  promptA: string;
  promptB: string;
  descriptionTarget?: number;
  promptTarget?: number;
};

type Result = {
  description: string;
  promptA: string;
  promptB: string;
  descriptionTarget?: number;
  promptTarget?: number;
};

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

function bundleOf(result: Result): string {
  return ["DESCRIPTION", result.description, "", "PROMPT A", result.promptA, "", "PROMPT B", result.promptB, ""].join(
    "\n",
  );
}

export function bindPlate(root: HTMLElement): () => void {
  const $ = <T extends Element>(selector: string) => {
    const node = root.querySelector(selector);
    if (!node) throw new Error(`Не найдено ${selector}`);
    return node as T;
  };

  const drop = $<HTMLLabelElement>("#plate-drop");
  const fileInput = $<HTMLInputElement>("#plate-file");
  const empty = $<HTMLElement>("#plate-empty");
  const preview = $<HTMLImageElement>("#plate-preview");
  const meta = $<HTMLElement>("#plate-meta");
  const nameEl = $<HTMLElement>("#plate-name");
  const sizeEl = $<HTMLElement>("#plate-size");
  const notes = $<HTMLTextAreaElement>("#plate-notes");
  const notesCount = $<HTMLElement>("#plate-notes-count");
  const descRange = $<HTMLInputElement>("#plate-desc-len");
  const promptRange = $<HTMLInputElement>("#plate-prompt-len");
  const descVal = $<HTMLElement>("#plate-desc-val");
  const promptVal = $<HTMLElement>("#plate-prompt-val");
  const go = $<HTMLButtonElement>("#plate-go");
  const another = $<HTMLButtonElement>("#plate-another");
  const errorEl = $<HTMLElement>("#plate-error");
  const idle = $<HTMLElement>("#plate-idle");
  const resultBox = $<HTMLElement>("#plate-result");
  const resultCount = $<HTMLElement>("#plate-result-count");
  const descriptionEl = $<HTMLElement>("#plate-description");
  const promptAEl = $<HTMLElement>("#plate-prompt-a");
  const promptBEl = $<HTMLElement>("#plate-prompt-b");
  const historyBlock = $<HTMLElement>("#plate-history");
  const historyList = $<HTMLUListElement>("#plate-history-list");

  let plate: FrameFile | null = null;
  let result: Result | null = null;
  let busy = false;
  let timer = 0;
  let copied = "";

  function showError(message: string) {
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
    root.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
      const key = button.dataset.copy || "";
      button.textContent = copied === key ? "Скопировано" : "Копировать";
    });
    const all = $<HTMLButtonElement>("#plate-copy-all");
    all.textContent = copied === "all" ? "Скопировано" : "Всё";
  }

  async function takeFile(file: File | undefined) {
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
      go.textContent = `Смотрю кадр · ${Math.floor((Date.now() - started) / 1000)} с`;
    };
    tick();
    timer = window.setInterval(tick, 250);
    try {
      const response = await describePhoto({
        data: {
          image: plate.image,
          width: plate.width,
          height: plate.height,
          aspect: plate.aspect,
          notes: notes.value,
          descriptionLength: Number(descRange.value),
          promptLength: Number(promptRange.value),
        },
      });
      if (!response.ok) {
        showError(response.error);
        return;
      }
      result = response;
      renderResult();
      const item: HistoryItem = {
        id: `${Date.now()}`,
        at: Date.now(),
        name: plate.fileName,
        thumb: plate.thumb,
        aspect: plate.aspect,
        description: response.description,
        promptA: response.promptA,
        promptB: response.promptB,
        descriptionTarget: response.descriptionTarget,
        promptTarget: response.promptTarget,
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

  function flash(key: string) {
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
    void takeFile(fileInput.files?.[0]);
    fileInput.value = "";
  };
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    drop.classList.add("is-over");
  };
  const onDragLeave = () => drop.classList.remove("is-over");
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    drop.classList.remove("is-over");
    void takeFile(event.dataTransfer?.files?.[0]);
  };
  const onPaste = (event: ClipboardEvent) => {
    const files = event.clipboardData?.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp|bmp|avif|tiff?|heic|heif|svg|ico)$/i.test(file.name)) {
      return;
    }
    event.preventDefault();
    void takeFile(file);
  };
  const onCopyClick = (event: Event) => {
    const button = (event.target as HTMLElement | null)?.closest("button");
    if (!button || !result) return;
    const key = button.dataset.copy;
    if (!key) return;
    const value = key === "description" ? result.description : key === "a" ? result.promptA : result.promptB;
    void copyText(value).then(() => flash(key));
  };
  const onCopyAll = () => {
    if (!result) return;
    void copyText(bundleOf(result)).then(() => flash("all"));
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
  $<HTMLButtonElement>("#plate-copy-all").addEventListener("click", onCopyAll);
  $<HTMLButtonElement>("#plate-download").addEventListener("click", onDownload);
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
