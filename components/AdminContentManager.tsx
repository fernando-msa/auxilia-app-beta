"use client";

import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type Tab = "noticias" | "atividades";

export default function AdminContentManager() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("noticias");
  const [status, setStatus] = useState<string>("");

  const [noticia, setNoticia] = useState({ titulo: "", resumo: "", categoria: "Juventude" });
  const [atividade, setAtividade] = useState({
    titulo: "",
    local: "",
    data: "",
    publico: "Jovens",
  });

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const handleGoogleLogin = async () => {
    setStatus("");
    await signInWithPopup(auth, googleProvider);
    setStatus("Login realizado. Permissões são validadas no servidor.");
  };

  const publish = async (type: Tab, data: Record<string, string>) => {
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, data }),
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(result.error ?? "Falha ao publicar conteúdo.");
    }
  };

  const publishNoticia = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await publish("noticias", noticia);
      setNoticia({ titulo: "", resumo: "", categoria: "Juventude" });
      setStatus("Notícia publicada com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao publicar notícia.");
    }
  };

  const publishAtividade = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await publish("atividades", atividade);
      setAtividade({ titulo: "", local: "", data: "", publico: "Jovens" });
      setStatus("Atividade publicada com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro ao publicar atividade.");
    }
  };

  return (
    <section className="section admin-panel">
      <h2>Publicação de Conteúdo (Equipe)</h2>
      <p className="section-description">
        Área para inserir notícias e agenda para os jovens. Autorização de escrita validada no
        servidor.
      </p>

      {!user ? (
        <button type="button" className="btn btn-dark" onClick={handleGoogleLogin}>
          Entrar com Google
        </button>
      ) : (
        <div className="admin-box">
          <p>
            Logado como <strong>{user.email}</strong>
          </p>

          <div className="tabs">
            <button
              type="button"
              className={tab === "noticias" ? "tab active" : "tab"}
              onClick={() => setTab("noticias")}
            >
              Nova notícia
            </button>
            <button
              type="button"
              className={tab === "atividades" ? "tab active" : "tab"}
              onClick={() => setTab("atividades")}
            >
              Nova atividade
            </button>
          </div>

          {tab === "noticias" ? (
            <form className="form-grid" onSubmit={publishNoticia}>
              <input
                required
                placeholder="Título"
                value={noticia.titulo}
                onChange={(e) => setNoticia((prev) => ({ ...prev, titulo: e.target.value }))}
              />
              <input
                required
                placeholder="Categoria"
                value={noticia.categoria}
                onChange={(e) => setNoticia((prev) => ({ ...prev, categoria: e.target.value }))}
              />
              <textarea
                required
                placeholder="Resumo"
                value={noticia.resumo}
                onChange={(e) => setNoticia((prev) => ({ ...prev, resumo: e.target.value }))}
              />
              <button type="submit" className="btn btn-dark">
                Publicar notícia
              </button>
            </form>
          ) : (
            <form className="form-grid" onSubmit={publishAtividade}>
              <input
                required
                placeholder="Título"
                value={atividade.titulo}
                onChange={(e) => setAtividade((prev) => ({ ...prev, titulo: e.target.value }))}
              />
              <input
                required
                placeholder="Local"
                value={atividade.local}
                onChange={(e) => setAtividade((prev) => ({ ...prev, local: e.target.value }))}
              />
              <input
                required
                placeholder="Data/Hora"
                value={atividade.data}
                onChange={(e) => setAtividade((prev) => ({ ...prev, data: e.target.value }))}
              />
              <input
                required
                placeholder="Público"
                value={atividade.publico}
                onChange={(e) => setAtividade((prev) => ({ ...prev, publico: e.target.value }))}
              />
              <button type="submit" className="btn btn-dark">
                Publicar atividade
              </button>
            </form>
          )}

          <button type="button" className="btn btn-ghost" onClick={() => signOut(auth)}>
            Sair
          </button>
        </div>
      )}

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
