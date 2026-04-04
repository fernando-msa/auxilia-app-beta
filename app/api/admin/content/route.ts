import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

type Payload = {
  type: "noticias" | "atividades";
  data: Record<string, string>;
};

const allowedCollections = {
  noticias: ["titulo", "resumo", "categoria"],
  atividades: ["titulo", "local", "data", "publico"],
} as const;

function getAllowedEmails() {
  const raw = process.env.CONTENT_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function sanitizePayload(payload: Payload) {
  const keys = allowedCollections[payload.type];
  const cleanData: Record<string, string> = {};

  keys.forEach((key) => {
    const value = payload.data[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Campo obrigatório inválido: ${key}`);
    }
    cleanData[key] = value.trim();
  });

  return cleanData;
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não enviado." }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const userEmail = decoded.email?.toLowerCase();
    const allowedEmails = getAllowedEmails();

    if (!userEmail || !allowedEmails.includes(userEmail)) {
      return NextResponse.json({ error: "Usuário sem permissão para publicar." }, { status: 403 });
    }

    const body = (await request.json()) as Payload;
    if (!body?.type || !(body.type in allowedCollections) || !body?.data) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const data = sanitizePayload(body);

    await getAdminDb().collection(body.type).add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: userEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
