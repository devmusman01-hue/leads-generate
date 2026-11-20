import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// Some local networks block the DNS SRV lookups that `mongodb+srv://` needs
// ("querySrv ECONNREFUSED"). In dev we resolve the SRV/TXT records ourselves
// through public DNS and hand the driver a plain mongodb:// URI.
async function resolveUri(uri: string) {
  if (!uri.startsWith("mongodb+srv://") || process.env.NODE_ENV === "production") return uri;
  try {
    const u = new URL(uri);
    const r = new dns.promises.Resolver();
    r.setServers(["8.8.8.8", "1.1.1.1"]);
    const srv = await r.resolveSrv(`_mongodb._tcp.${u.hostname}`);
    const hosts = srv.map((s) => `${s.name}:${s.port}`).join(",");
    const params = new URLSearchParams(u.search);
    try {
      const txt = new URLSearchParams((await r.resolveTxt(u.hostname)).flat().join("&"));
      txt.forEach((v, k) => !params.has(k) && params.set(k, v));
    } catch {}
    if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");
    const auth = u.username ? `${u.username}:${u.password}@` : "";
    return `mongodb://${auth}${hosts}/${u.pathname.slice(1)}?${params}`;
  } catch {
    return uri;
  }
}

const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  const raw = process.env.MONGODB_URI;
  if (!raw) throw new Error("MONGODB_URI is not set (see .env.local)");
  if (!g._mongo) {
    g._mongo = resolveUri(raw)
      .then((uri) => new MongoClient(uri).connect())
      .catch((e) => {
        g._mongo = undefined; // don't cache failures
        throw e;
      });
  }
  return (await g._mongo).db(process.env.MONGODB_DB ?? "leads_generate");
}
