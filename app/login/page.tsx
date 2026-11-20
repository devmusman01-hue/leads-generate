import { Radar } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <div className="float-icon mb-6 flex h-12 w-12 items-center justify-center bg-accent/20 text-accent">
          <Radar size={24} />
        </div>
        <h1 className="mb-1 text-xl font-semibold">Leads Gen</h1>
        <p className="mb-6 text-sm text-muted">Enter your password to continue.</p>
        <LoginForm />
      </div>
    </div>
  );
}
