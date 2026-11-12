"use client";

import { useState } from "react";
import { BUY_INTENTS, whatsappLink, type BuyIntent } from "@/lib/site";

const KEY = "fd_buy_intent";

export function readBuyIntent(): BuyIntent | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v === "invertir" || v === "vivir" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Pregunta "¿Para invertir o para vivir?" al elegir Comprar.
 * La respuesta adapta el mensaje, el botón y el texto de WhatsApp.
 */
export function BuyIntentPrompt({
  tone = "dark",
  onChange,
}: {
  tone?: "dark" | "light";
  onChange?: (v: BuyIntent) => void;
}) {
  const [intent, setIntent] = useState<BuyIntent | null>(null);
  const choose = (v: BuyIntent) => {
    setIntent(v);
    onChange?.(v);
    try {
      sessionStorage.setItem(KEY, v);
    } catch {}
  };
  const light = tone === "light";
  const info = intent ? BUY_INTENTS[intent] : null;

  return (
    <div
      className={`animate-[fadeUp_.7s_cubic-bezier(.16,1,.3,1)] border-y py-8 ${
        light ? "border-white/20" : "border-charcoal/12"
      }`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <p className="font-serif text-3xl md:text-4xl">¿Quieres comprar para invertir o para vivir?</p>
        <div className="flex gap-2">
          {(Object.keys(BUY_INTENTS) as BuyIntent[]).map((k) => {
            const active = intent === k;
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                className={`border px-5 py-2.5 text-sm transition-colors duration-300 ${
                  active
                    ? light
                      ? "border-white bg-white text-charcoal"
                      : "border-charcoal bg-charcoal text-white"
                    : light
                      ? "border-white/40 hover:border-white"
                      : "border-charcoal/20 hover:border-charcoal"
                }`}
              >
                {BUY_INTENTS[k].label}
              </button>
            );
          })}
        </div>
      </div>
      {info && (
        <div key={intent} className="mt-6 flex animate-[fadeUp_.6s_cubic-bezier(.16,1,.3,1)] flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <p className={`max-w-2xl text-[15px] leading-relaxed ${light ? "text-white/80" : "text-graphite"}`}>
            {info.text}
          </p>
          <a
            href={whatsappLink(info.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className={`eyebrow inline-flex h-12 shrink-0 items-center border px-6 transition duration-300 ${
              light
                ? "border-white bg-white text-charcoal hover:bg-transparent hover:text-white"
                : "border-charcoal bg-charcoal text-white hover:bg-white hover:text-charcoal"
            }`}
          >
            {info.cta}
          </a>
        </div>
      )}
    </div>
  );
}
