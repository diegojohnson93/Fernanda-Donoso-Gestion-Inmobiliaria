import { connection } from "next/server";
import { errorResponse } from "@/lib/http";
import { getStore } from "@/lib/store";

export async function GET() {
  await connection();
  try {
    return Response.json(await getStore().listConversations());
  } catch (e) {
    return errorResponse(e);
  }
}
