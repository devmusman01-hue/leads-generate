import { getDb } from "./db";

export async function focusCol() {
  return (await getDb()).collection("profile_settings");
}

export async function getFocus() {
  const d = await (await focusCol()).findOne({ _id: "focus" as never });
  return {
    include: (d?.include ?? []) as string[],
    exclude: (d?.exclude ?? []) as string[],
    notes: (d?.notes ?? "") as string,
  };
}
