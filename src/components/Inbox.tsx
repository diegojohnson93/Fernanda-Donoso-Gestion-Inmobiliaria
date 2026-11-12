"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Channel,
  ConversationStatus,
  ConversationWithMessages,
  Property,
} from "@/lib/types";
import { MODALITIES, detailsToText, priceLines } from "@/lib/ficha";
import {
  Button,
  ModalityPills,
  CHANNELS,
  ChannelBadge,
  CONFIDENCE,
  Pill,
  STATUSES,
  clock,
  inputClass,
  timeAgo,
  windowLeft,
} from "./ui";

type Filter = "pendientes" | "todas" | ConversationStatus;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data as T;
}

export function Inbox() {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pendientes");
  const [channel, setChannel] = useState<Channel | "todos">("todos");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      api<ConversationWithMessages[]>("/api/conversations"),
      api<Property[]>("/api/properties"),
    ]);
    setConversations(c);
    setProperties(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    const first = setTimeout(() => load().catch(() => setLoading(false)), 0);
    const t = setInterval(() => load().catch(() => {}), 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  const replace = (c: ConversationWithMessages) =>
    setConversations((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      const next = exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
      return next.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (channel !== "todos" && c.channel !== channel) return false;
      if (filter === "pendientes" && !(c.draft || c.status === "nuevo")) return false;
      if (filter !== "pendientes" && filter !== "todas" && c.status !== filter) return false;
      if (q) {
        const prop = properties.find((p) => p.id === c.property_id);
        const hay = [c.contact_name, prop?.code, prop?.title, ...c.messages.map((m) => m.text)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, properties, filter, channel, query]);

  const pendingCount = conversations.filter((c) => c.draft || c.status === "nuevo").length;
  const activeId = selectedId ?? visible[0]?.id ?? null;
  const selected = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-full">
      {/* Lista */}
      <aside
        className={`${mobileDetail ? "hidden" : "flex"} w-full flex-col border-r border-line bg-white md:flex md:w-[340px] md:shrink-0`}
      >
        <div className="space-y-2 border-b border-line p-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold">Mensajes</h1>
            <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setSimOpen(true)}>
              + Simular mensaje
            </Button>
          </div>
          <input
            className={inputClass}
            placeholder="Buscar por nombre, código o texto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["pendientes", `Por responder (${pendingCount})`],
                ["todas", "Todas"],
                ["visita", "Visitas"],
                ["descartado", "Descartadas"],
              ] as [Filter, string][]
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  filter === k ? "bg-brand text-white" : "bg-[#f1f2f4] text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["todos", "whatsapp", "instagram", "messenger"] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  channel === ch ? "bg-ink text-white" : "text-muted hover:bg-[#f1f2f4]"
                }`}
              >
                {ch === "todos" ? "Todos" : CHANNELS[ch].label}
              </button>
            ))}
          </div>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {loading && <li className="p-4 text-sm text-muted">Cargando…</li>}
          {!loading && visible.length === 0 && (
            <li className="p-6 text-center text-sm text-muted">No hay conversaciones aquí.</li>
          )}
          {visible.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const prop = properties.find((p) => p.id === c.property_id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedId(c.id);
                    setMobileDetail(true);
                  }}
                  className={`w-full border-b border-line px-3 py-3 text-left hover:bg-[#fafafa] ${
                    activeId === c.id ? "bg-brand-soft/60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ChannelBadge channel={c.channel} />
                    <span className="truncate text-sm font-semibold">{c.contact_name}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-muted">
                      {timeAgo(last?.created_at ?? c.updated_at)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-muted">
                    {last?.direction === "out" && <span className="text-ink">Tú: </span>}
                    {last?.text}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {prop ? (
                      <Pill className="bg-[#eef0f2] text-ink">{prop.code}</Pill>
                    ) : (
                      <Pill className={CONFIDENCE.baja.className}>¿Qué propiedad?</Pill>
                    )}
                    {c.draft && <Pill className="bg-accent-soft text-accent">Borrador listo</Pill>}
                    {c.status !== "nuevo" && (
                      <Pill className={STATUSES[c.status].className}>{STATUSES[c.status].label}</Pill>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Detalle */}
      <section className={`${mobileDetail ? "flex" : "hidden"} min-w-0 flex-1 md:flex`}>
        {selected ? (
          <ConversationView
            key={selected.id}
            convo={selected}
            properties={properties}
            onChange={replace}
            onBack={() => setMobileDetail(false)}
          />
        ) : (
          <div className="grid flex-1 place-items-center text-sm text-muted">
            Selecciona una conversación
          </div>
        )}
      </section>

      {simOpen && (
        <SimulateDialog
          properties={properties}
          onClose={() => setSimOpen(false)}
          onCreated={(c) => {
            replace(c);
            setSelectedId(c.id);
            setMobileDetail(true);
            setSimOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function ConversationView({
  convo,
  properties,
  onChange,
  onBack,
}: {
  convo: ConversationWithMessages;
  properties: Property[];
  onChange: (c: ConversationWithMessages) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState(convo.draft?.text ?? "");
  const [busy, setBusy] = useState<null | "send" | "draft" | "sim">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState(convo.notes);
  const [simText, setSimText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Cuando llega un borrador nuevo, se carga en el editor.
  const draftStamp = convo.draft?.generated_at ?? null;
  const [loadedStamp, setLoadedStamp] = useState(draftStamp);
  if (draftStamp !== loadedStamp) {
    setLoadedStamp(draftStamp);
    if (convo.draft) setText(convo.draft.text);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [convo.messages.length]);

  const prop = properties.find((p) => p.id === convo.property_id) ?? null;
  const left = windowLeft(convo.last_customer_message_at);
  const draft = convo.draft;

  const run = async (kind: "send" | "draft" | "sim", fn: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const patch = (body: Record<string, unknown>) =>
    run("draft", async () => {
      onChange(
        await api<ConversationWithMessages>(`/api/conversations/${convo.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      );
    });

  const regenerate = () =>
    run("draft", async () => {
      onChange(
        await api<ConversationWithMessages>(`/api/conversations/${convo.id}/draft`, {
          method: "POST",
        }),
      );
    });

  const send = () =>
    run("send", async () => {
      const res = await api<{
        result: { status: string; error?: string };
        conversation: ConversationWithMessages;
      }>(`/api/conversations/${convo.id}/send`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      onChange(res.conversation);
      if (res.result.status === "error") setError(res.result.error ?? "No se pudo enviar");
      else {
        setText("");
        setNotice(
          res.result.status === "simulado"
            ? "Respuesta registrada (envío simulado: este canal aún no está conectado o es una conversación de prueba)."
            : `Enviado por ${CHANNELS[convo.channel].label}.`,
        );
      }
    });

  const simulateReply = () =>
    run("sim", async () => {
      onChange(
        await api<ConversationWithMessages>("/api/simulate", {
          method: "POST",
          body: JSON.stringify({ conversation_id: convo.id, text: simText }),
        }),
      );
      setSimText("");
    });

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-4 py-2.5">
          <button className="mr-1 text-sm text-brand md:hidden" onClick={onBack}>
            ← Volver
          </button>
          <ChannelBadge channel={convo.channel} full />
          <span className="font-semibold">{convo.contact_name}</span>
          {left !== null && (
            <Pill
              className={
                left <= 0
                  ? "bg-[#f8e5e3] text-bad"
                  : left < 4
                    ? "bg-[#fbf1df] text-warn"
                    : "bg-[#eef0f2] text-muted"
              }
            >
              {left <= 0
                ? "Ventana de 24 h cerrada"
                : `Quedan ${left < 1 ? `${Math.round(left * 60)} min` : `${Math.floor(left)} h`} para responder`}
            </Pill>
          )}
          <div className="ml-auto flex items-center gap-2">
            <select
              className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
              value={convo.status}
              onChange={(e) => patch({ status: e.target.value })}
            >
              {(Object.keys(STATUSES) as ConversationStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUSES[s].label}
                </option>
              ))}
            </select>
            <Button className="xl:hidden" onClick={() => setShowInfo((v) => !v)}>
              Ficha
            </Button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {convo.referral_text && (
            <div className="mx-auto w-fit rounded-full bg-white px-3 py-1 text-xs text-muted shadow-sm">
              Llegó desde · {convo.referral_text}
            </div>
          )}
          {convo.messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : ""}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  m.direction === "out"
                    ? "rounded-br-md bg-brand text-white"
                    : "rounded-bl-md bg-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div
                  className={`mt-1 text-right text-[10px] ${
                    m.direction === "out" ? "text-white/70" : "text-muted"
                  }`}
                >
                  {clock(m.created_at)}
                  {m.send_status === "simulado" && " · simulado"}
                  {m.send_status === "error" && " · error al enviar"}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Borrador / respuesta */}
        <div className="border-t border-line bg-white p-3">
          {draft && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-accent">
                {draft.engine === "ia" ? "Borrador de la IA" : "Borrador (plantilla, IA sin configurar)"}
              </span>
              {draft.property_code ? (
                <Pill className={CONFIDENCE[draft.confidence].className}>
                  {draft.property_code} · {CONFIDENCE[draft.confidence].label.toLowerCase()}
                </Pill>
              ) : (
                <Pill className={CONFIDENCE.baja.className}>
                  Propiedad sin identificar: el borrador pregunta cuál es
                </Pill>
              )}
              <span className="text-muted">{draft.reasoning}</span>
            </div>
          )}
          {draft && draft.missing_info.length > 0 && (
            <div className="mb-2 rounded-lg bg-[#fbf1df] px-3 py-2 text-xs text-warn">
              <b>Falta en la ficha:</b> {draft.missing_info.join(" · ")}. Revisa el borrador o
              completa la ficha y regenera.
            </div>
          )}
          <textarea
            className={`${inputClass} min-h-[96px] resize-y`}
            placeholder={
              draft ? "" : "Escribe una respuesta o pide una sugerencia a la IA…"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {left !== null && left <= 0 && convo.channel === "whatsapp" && (
            <p className="mt-1 text-xs text-bad">
              Pasaron más de 24 h desde el último mensaje del cliente: WhatsApp solo permite
              escribirle con una plantilla aprobada.
            </p>
          )}
          {error && <p className="mt-1 text-xs text-bad">{error}</p>}
          {notice && <p className="mt-1 text-xs text-ok">{notice}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="primary" disabled={!text.trim() || busy !== null} onClick={send}>
              {busy === "send" ? "Enviando…" : draft ? "Aprobar y enviar" : "Enviar"}
            </Button>
            <Button disabled={busy !== null} onClick={regenerate}>
              {busy === "draft" ? "Pensando…" : draft ? "Regenerar" : "Sugerir respuesta con IA"}
            </Button>
            {draft && (
              <Button variant="ghost" disabled={busy !== null} onClick={() => patch({ draft: null })}>
                Descartar borrador
              </Button>
            )}
            {convo.external_id.startsWith("sim-") && (
              <div className="ml-auto flex min-w-[220px] flex-1 gap-1 sm:max-w-sm">
                <input
                  className={`${inputClass} !py-1.5 text-xs`}
                  placeholder="Simular respuesta del cliente…"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && simText.trim() && simulateReply()}
                />
                <Button
                  className="!py-1.5 text-xs"
                  disabled={!simText.trim() || busy !== null}
                  onClick={simulateReply}
                >
                  {busy === "sim" ? "…" : "Simular"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral: propiedad y notas */}
      <aside
        className={`${showInfo ? "flex" : "hidden"} w-[300px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line bg-white p-4 xl:flex`}
      >
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Propiedad
          </label>
          <select
            className={inputClass}
            value={convo.property_id ?? ""}
            onChange={(e) => patch({ property_id: e.target.value || null })}
          >
            <option value="">Sin identificar</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.title}
                {p.active ? "" : " (no disponible)"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted">
            {convo.property_source === "manual" && "Elegida por ti. La IA usará esta ficha."}
            {convo.property_source === "aviso" && "Detectada por el aviso desde donde escribió."}
            {convo.property_source === "codigo" && "Detectada por el código que escribió el cliente."}
            {convo.property_source === "ia" && "Deducida por la IA a partir de la conversación."}
            {!convo.property_source && "Si la eliges aquí, la IA responderá con esa ficha."}
          </p>
        </div>

        {prop && (
          <div className="rounded-xl border border-line p-3 text-sm">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-semibold text-brand">{prop.code}</span>
              <ModalityPills modalities={prop.modalities ?? []} />
              {!prop.active && <Pill className="bg-[#f8e5e3] text-bad">No disponible</Pill>}
            </div>
            <div className="mt-1 font-semibold leading-snug">{prop.title}</div>
            <div className="mt-1 space-y-0.5 text-muted">
              {priceLines(prop.modalities ?? [], prop.details ?? {}).map((l) => (
                <div key={l.modality}>
                  <span className="text-ink/70">{MODALITIES[l.modality].short}:</span> {l.text}
                </div>
              ))}
            </div>
            <div className="text-muted">
              {[
                prop.bedrooms && `${prop.bedrooms}D`,
                prop.bathrooms && `${prop.bathrooms}B`,
                prop.area_m2 && `${prop.area_m2} m²`,
                prop.sector,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
            <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-ink/80">
              {[detailsToText(prop.modalities ?? [], prop.details ?? {}), prop.brief]
                .filter(Boolean)
                .join("\n")}
            </p>
            {prop.private_notes && (
              <div className="mt-2 rounded-lg bg-[#f4f4f2] p-2 text-xs">
                <b>Nota privada:</b> {prop.private_notes}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Notas internas
          </label>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            value={notes}
            placeholder="Ej.: busca para marzo, tiene preaprobado crédito…"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== convo.notes && patch({ notes })}
          />
          <p className="mt-1 text-[11px] text-muted">La IA también considera estas notas.</p>
        </div>

        <div className="text-xs text-muted">
          <div>Canal: {CHANNELS[convo.channel].label}</div>
          <div>ID: {convo.external_id}</div>
          <div>Primer contacto: {clock(convo.created_at)}</div>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function SimulateDialog({
  properties,
  onClose,
  onCreated,
}: {
  properties: Property[];
  onClose: () => void;
  onCreated: (c: ConversationWithMessages) => void;
}) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [adId, setAdId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const withAds = properties.filter((p) => p.ad_ids.length);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      onCreated(
        await api<ConversationWithMessages>("/api/simulate", {
          method: "POST",
          body: JSON.stringify({ channel, contact_name: name, text, ad_id: adId || undefined }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-semibold">Simular mensaje entrante</h2>
          <p className="text-xs text-muted">
            Para probar cómo responde la IA antes de conectar los canales reales.
          </p>
        </div>
        <div className="flex gap-1">
          {(Object.keys(CHANNELS) as Channel[]).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-sm ${
                channel === ch ? "border-brand bg-brand-soft text-brand" : "border-line"
              }`}
            >
              {CHANNELS[ch].label}
            </button>
          ))}
        </div>
        <input
          className={inputClass}
          placeholder="Nombre del cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={`${inputClass} min-h-[90px]`}
          placeholder="Ej.: Hola, ¿el depto de Reñaca acepta mascotas?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <label className="mb-1 block text-xs text-muted">¿Llegó desde un aviso? (opcional)</label>
          <select className={inputClass} value={adId} onChange={(e) => setAdId(e.target.value)}>
            <option value="">No, escribió directo</option>
            {withAds.map((p) => (
              <option key={p.id} value={p.ad_ids[0]}>
                Aviso de {p.code} · {p.title}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-xs text-bad">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" disabled={!text.trim() || busy} onClick={submit}>
            {busy ? "Generando borrador…" : "Simular"}
          </Button>
        </div>
      </div>
    </div>
  );
}
