import { getDb } from "./db";

export async function templateCol() {
  return (await getDb()).collection("cv_template");
}

export async function getTemplate() {
  return (await templateCol()).findOne({ _id: "current" as never });
}

// Turn the uploaded file into something an agent can read directly.
export async function extractText(filename: string, buf: Buffer) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  try {
    if (ext === "docx") {
      const mammoth = await import("mammoth");
      return (await mammoth.extractRawText({ buffer: buf })).value.trim();
    }
    if (["txt", "md", "tex"].includes(ext)) return buf.toString("utf8").trim();
  } catch {}
  return "";
}

// Finds {{full_name}} / [[full_name]] / {full_name} style placeholders.
export function findPlaceholders(text: string) {
  const found = new Set<string>();
  for (const m of text.matchAll(/\{\{\s*([^{}]+?)\s*\}\}|\[\[\s*([^\[\]]+?)\s*\]\]/g)) found.add((m[1] ?? m[2]).trim());
  return [...found];
}
