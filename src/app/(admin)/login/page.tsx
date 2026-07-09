"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginError() {
  const params = useSearchParams();
  const error = params.get("error");
  const callbackUrl = params.get("callbackUrl");

  let message = "";
  if (error === "RateLimit") {
    message = "Muitas tentativas. Aguarde 15 minutos.";
  } else if (error === "Configuration") {
    message = "Erro de configuração do servidor.";
  } else if (error === "CredentialsSignin") {
    message = "E-mail ou senha inválidos. Tente novamente.";
  } else if (error) {
    message = "Erro de autenticação. Tente novamente.";
  } else if (callbackUrl) {
    // Redirecionado pelo middleware (sessão expirada ou token inválido)
    message = "Sessão expirada. Faça login novamente.";
  }

  if (!message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
      {message}
    </div>
  );
}

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Buscar CSRF token
      const csrfRes = await fetch("/api/auth/csrf", { credentials: "same-origin" });
      if (!csrfRes.ok) throw new Error("CSRF fetch failed: " + csrfRes.status);
      const { csrfToken } = await csrfRes.json();

      // 2. POST para o callback de credenciais
      const body = new URLSearchParams({
        csrfToken,
        email,
        password,
        callbackUrl: "/painel",
        json: "true",
      });

      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        credentials: "same-origin",
      });

      // 3. Ler resposta JSON
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        console.error("[LOGIN] Resposta não-JSON", res.status, await res.text().catch(() => ""));
        throw new Error("Resposta não-JSON do servidor (status " + res.status + ")");
      }

      console.log("[LOGIN] Resposta do callback:", { status: res.status, data });

      if (data.url && !data.url.includes("error=")) {
        window.location.href = data.url;
        return;
      }

      // Extrair tipo de erro da URL (ex: "?error=CredentialsSignin")
      const errorMatch = data.url?.match(/[?&]error=([^&]+)/);
      const errorType = errorMatch ? errorMatch[1] : null;
      console.warn("[LOGIN] Erro de autenticação:", { errorType, url: data.url });

      let msg = "E-mail ou senha inválidos. Tente novamente.";
      if (errorType === "Configuration") msg = "Erro de configuração do servidor (NEXTAUTH_SECRET?).";
      else if (errorType === "RateLimit") msg = "Muitas tentativas. Aguarde 15 minutos.";
      else if (errorType === "CredentialsSignin") msg = "E-mail ou senha inválidos.";
      else if (data.url === undefined && !res.ok) msg = "Erro no servidor (status " + res.status + "). Tente novamente.";
      setError(msg);
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                      bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-gradient shadow-prime mb-4">
            <span className="text-white font-black text-xl">AP</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-ink-500 text-sm mt-1">AutoPrime Concessionária</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-8 border border-white/8 space-y-4"
        >
          <div>
            <label className="text-xs text-ink-400 font-medium block mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@autoprime.com.br"
              className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                         placeholder-ink-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-ink-400 font-medium block mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ink-800 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm
                           placeholder-ink-600 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Suspense fallback={null}>
            <LoginError />
          </Suspense>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-prime w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Entrando...</> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-ink-700 text-xs mt-6">
          Acesso restrito à equipe AutoPrime
        </p>
      </div>
    </div>
  );
}