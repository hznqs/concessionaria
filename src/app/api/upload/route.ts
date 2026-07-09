import { NextRequest, NextResponse } from "next/server";
import { processAndUpload } from "@/lib/upload";
import { requireAdmin, requireCsrf } from "@/lib/admin-auth";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    requireCsrf(req);
  } catch {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
  }

  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const result = await processAndUpload(file);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno no upload";
    console.error("[upload]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
