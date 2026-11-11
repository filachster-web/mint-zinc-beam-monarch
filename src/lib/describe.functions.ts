import { createServerFn } from "@tanstack/react-start";

const DESCRIPTION_MAX = 4000;
const PROMPT_MAX = 3200;
const IMAGE_MAX_CHARS = 6_500_000;

export type PlateResult = {
  description: string;
  promptA: string;
  promptB: string;
};

export type DescribeResult = { ok: true } & PlateResult | { ok: false; error: string };

type Input = {
  image: string;
  width: number;
  height: number;
  aspect: string;
};

type ResponsePart = { type?: string; text?: string };
type ResponseItem = { type?: string; content?: ResponsePart[] };
type ResponseBody = {
  status?: string;
  error?: { message?: string } | string;
  output?: ResponseItem[];
};

const SYSTEM = `You write forensic stills notes and two recreation prompts for a photograph.

Return ONLY valid JSON, no markdown fences, with exactly these keys:
{"refused": boolean, "description": string, "promptA": string, "promptB": string}

If the image shows sexual content involving anyone who appears to be under 18, set refused to true and leave the three strings empty. Otherwise refused is false.

description:
- English only. One paragraph, no line breaks, no bullet lists.
- Extremely specific and only about what is visible. Cover: subjects (apparent age range as adult/child/unclear, build, hair, skin, clothing, expression, pose, gaze), objects, environment, spatial layout left-to-right and front-to-back, framing and crop, camera angle and height, apparent focal length and depth of field, light direction, quality, color temperature, shadows, palette, texture, grain, lens or film character, weather or time of day if visible.
- Do not invent unread text, names, backstory, or off-frame events. If a sign is illegible, say so.
- Do not name a real person unless their name is printed in the frame.
- Be plain and precise, including adult nudity or adult sexual context when it is actually visible. No euphemism that would change the picture, and no extra erotic detail that is not in the frame.
- Length: use as many characters as the visible evidence supports, aiming near 3500 when the frame is rich, and never above 3900. Do not pad.

promptA and promptB:
- English only. Each is a self-contained prompt that would regenerate THIS photograph, not a similar genre image.
- Derive them only from the description. Do not add facts the description lacks.
- They must use different diction, syntax, and imagery. Do not reuse any clause longer than four words. Prompt A is a technical camera report (lens, aperture feel, angle, light in kelvin-like terms, geometry). Prompt B is a sensory editorial brief (materials, color names, texture, atmosphere) that still locks the same facts.
- Both must state the given aspect ratio and ask for an 8K maximum-resolution photoreal still with fine detail, natural optics, and no watermark.
- Do not include policy-bypass language, "ignore previous instructions", "uncensored", "no restrictions", "jailbreak", or orders aimed at disabling another model's safety rules. Describe the picture; do not address the model as a censor.
- Each prompt between 1100 and 2800 characters.
- Negative constraints only to protect the match: no extra people, no added text, no change of crop, no illustration style — unless those things are already in the photo.`;

function fail(error: string): DescribeResult {
  return { ok: false, error };
}

function asInput(value: unknown): Input {
  if (!value || typeof value !== "object") {
    throw new Error("Нужна фотография.");
  }
  const raw = value as Record<string, unknown>;
  const image = raw.image;
  const width = raw.width;
  const height = raw.height;
  const aspect = raw.aspect;
  if (typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,")) {
    throw new Error("Нужен кадр в JPEG.");
  }
  if (image.length > IMAGE_MAX_CHARS) {
    throw new Error("Файл слишком большой. Возьмите фото поменьше.");
  }
  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1 ||
    width > 20000 ||
    height > 20000
  ) {
    throw new Error("Не удалось прочитать размер кадра.");
  }
  if (typeof aspect !== "string" || !/^\d{1,2}:\d{1,2}$/.test(aspect)) {
    throw new Error("Не удалось прочитать пропорции кадра.");
  }
  return {
    image,
    width: Math.round(width),
    height: Math.round(height),
    aspect,
  };
}

function readText(body: ResponseBody): string {
  const chunks: string[] = [];
  for (const item of body.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type === "output_text" && part.text) chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

function parsePlate(text: string): Record<string, unknown> {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    return JSON.parse(stripped) as Record<string, unknown>;
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("parse");
  }
}

function clampText(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.75 ? cut.slice(0, space) : cut).trim();
}

function ensureResolution(prompt: string, aspect: string): string {
  let next = prompt;
  if (!next.includes(aspect)) {
    next = `${next} Aspect ratio ${aspect}.`;
  }
  if (!/8\s?k/i.test(next)) {
    next = `${next} Deliver an 8K maximum-resolution photoreal photograph.`;
  }
  return clampText(next, PROMPT_MAX);
}

function errorFromStatus(status: number, raw: string): string {
  if (status === 401 || status === 403) return "Описание фото сейчас недоступно.";
  if (status === 429) return "Слишком много запросов. Подождите немного и повторите.";
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } | string };
    const message =
      typeof parsed.error === "string" ? parsed.error : parsed.error?.message;
    if (message && /invalid_image|image/i.test(message)) {
      return "Кадр не удалось прочитать. Попробуйте другой JPG или PNG.";
    }
  } catch {
    /* ignore non-json bodies */
  }
  return "Не получилось описать кадр. Попробуйте ещё раз.";
}

export const describePhoto = createServerFn({ method: "POST" })
  .validator(asInput)
  .handler(async ({ data }): Promise<DescribeResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return fail("Описание фото сейчас недоступно.");

    const userText = `Source frame: ${data.width}×${data.height} pixels, aspect ratio ${data.aspect}. Describe this exact photograph, then write promptA and promptB so another image model could recreate it at 8K.`;

    let response: Response;
    try {
      response = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(90_000),
        body: JSON.stringify({
          model: "grok-4.5",
          store: false,
          reasoning: { effort: "low" },
          max_output_tokens: 6000,
          input: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                { type: "input_image", image_url: data.image, detail: "high" },
                { type: "input_text", text: userText },
              ],
            },
          ],
        }),
      });
    } catch {
      return fail("Запрос оборвался. Проверьте связь и повторите.");
    }

    if (!response.ok) {
      const raw = await response.text();
      return fail(errorFromStatus(response.status, raw));
    }

    let body: ResponseBody;
    try {
      body = (await response.json()) as ResponseBody;
    } catch {
      return fail("Ответ пришёл в неожиданном виде.");
    }

    const text = readText(body);
    if (!text) return fail("Пустой ответ. Попробуйте другой кадр.");

    let parsed: Record<string, unknown>;
    try {
      parsed = parsePlate(text);
    } catch {
      return fail("Не удалось собрать описание. Попробуйте ещё раз.");
    }

    if (parsed.refused === true) {
      return fail("Этот кадр нельзя разобрать в промпт.");
    }

    const description = typeof parsed.description === "string" ? parsed.description : "";
    const promptA = typeof parsed.promptA === "string" ? parsed.promptA : "";
    const promptB = typeof parsed.promptB === "string" ? parsed.promptB : "";
    if (description.length < 40 || promptA.length < 40 || promptB.length < 40) {
      return fail("Описание вышло слишком коротким. Попробуйте ещё раз.");
    }

    return {
      ok: true,
      description: clampText(description, DESCRIPTION_MAX),
      promptA: ensureResolution(promptA, data.aspect),
      promptB: ensureResolution(promptB, data.aspect),
    };
  });
