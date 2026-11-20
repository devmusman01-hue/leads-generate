import dns from "node:dns";
import { MongoClient } from "mongodb";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("FAIL: MONGODB_URI is not set in .env.local");
  process.exit(1);
}
console.log("Connecting to:", uri.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@"));
try {
  const c = await new MongoClient(uri, { serverSelectionTimeoutMS: 10000 }).connect();
  await c.db("admin").command({ ping: 1 });
  console.log("OK: connected to MongoDB Atlas");
  await c.close();
} catch (e) {
  console.log("FAIL:", e.message);
  if (/bad auth|auth/i.test(e.message)) console.log("-> Wrong username/password in MONGODB_URI");
  if (/ECONN|ENOTFOUND|querySrv/i.test(e.message)) console.log("-> Network/DNS problem. Try the non-SRV mongodb:// string, or turn off VPN.");
  if (/whitelist|IP|timed out|Server selection/i.test(e.message)) console.log("-> Atlas Network Access may not allow your IP. Add 0.0.0.0/0.");
}
process.exit(0);
