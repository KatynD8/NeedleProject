// supabase/functions/ls-webhook/index.ts — v4
// Reçoit les webhooks LemonSqueezy et synchronise la table licenses.
//
// IMPORTANT : LemonSqueezy n'envoie PAS les webhooks dans l'ordre.
// On peut recevoir license_key_created avant order_created.
// Tous les handlers utilisent UPSERT pour être résilients à l'ordre d'arrivée.

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const secret = Deno.env.get("LS_WEBHOOK_SECRET");
  if (!secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify("HMAC", key, hexToBytes(signature), new TextEncoder().encode(body));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

function getExpiresAt(plan: string, fromDate: Date = new Date()): string {
  const d = new Date(fromDate);
  if (plan === "yearly") d.setFullYear(d.getFullYear() + 1);
  else                   d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

function detectPlan(variantId: string): "monthly" | "yearly" {
  const yearlyId = Deno.env.get("LS_VARIANT_YEARLY_ID") || "";
  return String(variantId) === String(yearlyId) ? "yearly" : "monthly";
}

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body      = await req.text();
  const signature = req.headers.get("X-Signature") ?? "";

  const valid = await verifySignature(body, signature);
  if (!valid) {
    console.error("Signature webhook invalide");
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(body); }
  catch { return new Response("Invalid JSON", { status: 400 }); }

  const eventName: string = payload.meta?.event_name ?? "";
  const data              = payload.data ?? {};
  const attributes        = data.attributes ?? {};

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log(`Événement reçu : ${eventName}`);

  // ── order_created ─────────────────────────────────────────────────────
  // Upsert sur ls_order_id. Si la ligne existe déjà (license_key_created
  // est arrivé en premier), on ne touche PAS à license_key — on ne ré-écrit
  // que les champs liés à l'order.
  if (eventName === "order_created") {
    const orderId    = String(data.id ?? "");
    const orderItems = attributes.first_order_item ?? {};
    const variantId  = String(orderItems.variant_id ?? "");
    const plan       = detectPlan(variantId);

    // Vérifie si une ligne existe déjà pour cet order
    const { data: existing } = await supabase
      .from("licenses")
      .select("id, license_key")
      .eq("ls_order_id", orderId)
      .maybeSingle();

    if (existing) {
      // license_key_created déjà passé — on enrichit avec les infos d'order
      const { error } = await supabase
        .from("licenses")
        .update({
          ls_variant_id:  variantId,
          customer_email: attributes.user_email ?? "",
          customer_name:  attributes.user_name  ?? "",
          plan,
        })
        .eq("ls_order_id", orderId);

      if (error) {
        console.error("Erreur enrichissement order:", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(`Order ${orderId} enrichi (license_key déjà présente)`);
    } else {
      // Première trace de cet order — création avec placeholder
      const tempKey = `pending-${orderId}`;
      const { error } = await supabase.from("licenses").insert({
        license_key:    tempKey,
        ls_order_id:    orderId,
        ls_variant_id:  variantId,
        customer_email: attributes.user_email ?? "",
        customer_name:  attributes.user_name  ?? "",
        status:         "active",
        plan,
        expires_at:     getExpiresAt(plan),
      });

      if (error) {
        console.error("Erreur insertion order:", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(`Order ${orderId} créé en attente de license_key`);
    }

    return new Response("OK", { status: 200 });
  }

  // ── license_key_created ──────────────────────────────────────────────
  // Upsert qui crée la ligne si order_created n'est pas encore arrivé.
  if (eventName === "license_key_created") {
    const orderId    = String(attributes.order_id ?? "");
    const realKey    = attributes.key ?? "";
    const expiresLs  = attributes.expires_at ? new Date(attributes.expires_at) : null;

    if (!realKey || !orderId) {
      console.error("license_key_created sans key ou order_id");
      return new Response("Missing data", { status: 422 });
    }

    // Vérifie si l'order est déjà en base
    const { data: existing } = await supabase
      .from("licenses")
      .select("id")
      .eq("ls_order_id", orderId)
      .maybeSingle();

    if (existing) {
      // order_created déjà passé — on remplace la key placeholder
      const updates: Record<string, any> = { license_key: realKey };
      if (expiresLs) updates.expires_at = expiresLs.toISOString();

      const { error } = await supabase
        .from("licenses")
        .update(updates)
        .eq("ls_order_id", orderId);

      if (error) {
        console.error("Erreur MAJ license_key:", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(`License key attribuée à order ${orderId} : ${realKey}`);
    } else {
      // license_key_created arrivé en premier — création anticipée
      const { error } = await supabase.from("licenses").insert({
        license_key: realKey,
        ls_order_id: orderId,
        status:      "active",
        expires_at:  expiresLs ? expiresLs.toISOString() : null,
      });

      if (error) {
        console.error("Erreur création anticipée:", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(`Licence créée anticipée : ${realKey} (order ${orderId})`);
    }

    return new Response("OK", { status: 200 });
  }

  // ── subscription_created ─────────────────────────────────────────────
  if (eventName === "subscription_created") {
    const subscriptionId = String(data.id ?? "");
    const orderId        = String(attributes.order_id ?? "");
    const variantId      = String(attributes.variant_id ?? "");
    const renewsAt       = attributes.renews_at ? new Date(attributes.renews_at) : null;

    const updates: Record<string, any> = { ls_subscription_id: subscriptionId };
    if (variantId) updates.ls_variant_id = variantId;
    if (renewsAt)  updates.expires_at    = renewsAt.toISOString();

    const { error } = await supabase
      .from("licenses")
      .update(updates)
      .eq("ls_order_id", orderId);

    if (error) {
      console.error("Erreur liaison subscription:", error);
      return new Response("DB error", { status: 500 });
    }
    console.log(`Subscription ${subscriptionId} liée à order ${orderId}`);
    return new Response("OK", { status: 200 });
  }

  // ── subscription_updated ─────────────────────────────────────────────
  if (eventName === "subscription_updated") {
    const subscriptionId = String(data.id ?? "");
    const lsStatus       = attributes.status ?? "";
    const variantId      = String(attributes.variant_id ?? "");
    const plan           = detectPlan(variantId);

    const statusMap: Record<string, string> = {
      active:    "active",
      past_due:  "active",
      paused:    "paused",
      unpaid:    "expired",
      cancelled: "cancelled",
      expired:   "expired",
      trial:     "active",
    };
    const status = statusMap[lsStatus] ?? "active";

    const renewsAt  = attributes.renews_at ? new Date(attributes.renews_at) : new Date();
    const expiresAt = getExpiresAt(plan, renewsAt);

    const { error } = await supabase
      .from("licenses")
      .update({ status, plan, expires_at: expiresAt, ls_variant_id: variantId })
      .eq("ls_subscription_id", subscriptionId);

    if (error) {
      console.error("Erreur mise à jour abonnement:", error);
      return new Response("DB error", { status: 500 });
    }
    console.log(`Abonnement ${subscriptionId} mis à jour → ${status}`);
    return new Response("OK", { status: 200 });
  }

  // ── subscription_cancelled ───────────────────────────────────────────
  if (eventName === "subscription_cancelled") {
    const subscriptionId = String(data.id ?? "");
    const { error } = await supabase
      .from("licenses")
      .update({ status: "cancelled" })
      .eq("ls_subscription_id", subscriptionId);

    if (error) {
      console.error("Erreur annulation:", error);
      return new Response("DB error", { status: 500 });
    }
    console.log(`Abonnement ${subscriptionId} annulé`);
    return new Response("OK", { status: 200 });
  }

  // ── license_key_updated ──────────────────────────────────────────────
  if (eventName === "license_key_updated") {
    const oldKey = attributes.key     ?? "";
    const newKey = attributes.new_key ?? oldKey;

    if (oldKey && newKey && oldKey !== newKey) {
      const { error } = await supabase
        .from("licenses")
        .update({ license_key: newKey })
        .eq("license_key", oldKey);

      if (error) {
        console.error("Erreur mise à jour key:", error);
        return new Response("DB error", { status: 500 });
      }
      console.log(`Key mise à jour : ${oldKey} → ${newKey}`);
    }

    return new Response("OK", { status: 200 });
  }

  console.log(`Événement ignoré : ${eventName}`);
  return new Response("OK", { status: 200 });
});