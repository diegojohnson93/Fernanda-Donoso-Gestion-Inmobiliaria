import { connection } from "next/server";
import { aiEnabled } from "@/lib/ai";
import { authEnabled } from "@/lib/auth";
import { mailEnabled, notifyEmail } from "@/lib/mail";
import { channelConfigured } from "@/lib/meta";
import { getStore } from "@/lib/store";

export async function GET() {
  await connection();
  return Response.json({
    store: getStore().kind,
    ai: aiEnabled(),
    auth: authEnabled(),
    mail: mailEnabled(),
    notify: Boolean(notifyEmail()),
    channels: {
      whatsapp: channelConfigured("whatsapp"),
      messenger: channelConfigured("messenger"),
      instagram: channelConfigured("instagram"),
    },
  });
}
