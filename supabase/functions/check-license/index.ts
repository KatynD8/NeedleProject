// supabase/functions/check-license/index.ts — v2
// Appelée par l'app Electron au démarrage (ou à l'activation initiale).
// Reçoit une license_key en POST, retourne son statut.
//
// Réponse :
//   { valid: true,  status, plan, expires_at, customer_email }  si active
//   { valid: false, reason }                                     si invalide

import { serve }        from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type":                 "application/json",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ valid: false, reason: "method_not_allowed" }),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  let body: any;
  try { body = await req.json(); }
  catch {
    return new Response(
      JSON.stringify({ valid: false, reason: "invalid_json" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Normalisation côté client : trim + retirer espaces internes
  const licenseKey: string = (body.license_key ?? "").trim().replace(/\s/g, "");

  if (!licenseKey) {
    return new Response(
      JSON.stringify({ valid: false, reason: "missing_license_key" }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Lookup insensible à la casse via ilike — LemonSqueezy stocke en minuscules
  // mais l'utilisateur peut coller la clé telle qu'elle apparaît dans l'email
  // (souvent en majuscules dans l'UI LS).
  const { data: license, error } = await supabase
    .from("licenses")
    .select("id, status, plan, expires_at, customer_email, activation_count, max_activations")
    .ilike("license_key", licenseKey)
    .maybeSingle();

  if (error) {
    console.error("Erreur DB check-license:", error);
    return new Response(
      JSON.stringify({ valid: false, reason: "server_error" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }

  if (!license) {
    return new Response(
      JSON.stringify({ valid: false, reason: "not_found" }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  if (license.status === "cancelled" || license.status === "expired") {
    return new Response(
      JSON.stringify({ valid: false, reason: license.status }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  if (license.expires_at) {
    const expiresAt = new Date(license.expires_at);
    if (expiresAt < new Date()) {
      await supabase
        .from("licenses")
        .update({ status: "expired" })
        .eq("id", license.id);

      return new Response(
        JSON.stringify({ valid: false, reason: "expired" }),
        { status: 200, headers: CORS_HEADERS }
      );
    }
  }

  // Activation initiale (premier lancement)
  const isActivation = body.activate === true;

  if (isActivation) {
    if (license.activation_count >= license.max_activations) {
      return new Response(
        JSON.stringify({ valid: false, reason: "max_activations_reached" }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    await supabase
      .from("licenses")
      .update({
        activation_count: license.activation_count + 1,
        activated_at:     new Date().toISOString(),
      })
      .eq("id", license.id);
  }

  return new Response(
    JSON.stringify({
      valid:          true,
      status:         license.status,
      plan:           license.plan,
      expires_at:     license.expires_at,
      customer_email: license.customer_email,
    }),
    { status: 200, headers: CORS_HEADERS }
  );
});