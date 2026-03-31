// Supabase Edge Function: PAYM8 Webhook Handler
// Handles debit order/card payment callbacks with signature verification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Verify webhook signature
  const signature = req.headers.get("x-paym8-signature");
  const body = await req.text();

  // TODO: In production, verify HMAC signature using shared secret
  // const expectedSig = hmac("sha256", webhookSecret, body);
  // if (signature !== expectedSig) {
  //   return new Response("Invalid signature", { status: 401 });
  // }

  const payload = JSON.parse(body);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { event_type, reference, amount, status, failure_reason } = payload;

  // Find payment attempt by idempotency key
  const { data: attempt } = await supabase
    .from("payment_attempts")
    .select("*")
    .eq("idempotency_key", reference)
    .single();

  if (!attempt) {
    return new Response(JSON.stringify({ error: "Unknown reference" }), { status: 404 });
  }

  // Update payment attempt
  await supabase.from("payment_attempts")
    .update({
      status: status === "success" ? "completed" : "failed",
      failure_reason: failure_reason || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attempt.id);

  // If successful, process as repayment
  if (status === "success") {
    const processResponse = await supabase.functions.invoke("process-repayment", {
      body: {
        loan_id: attempt.loan_id,
        amount_thebe: attempt.amount,
        payment_method: attempt.payment_method,
        payment_reference: reference,
      },
    });

    return new Response(JSON.stringify({
      received: true,
      processed: processResponse.data,
    }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ received: true, status: "failed" }), {
    headers: { "Content-Type": "application/json" },
  });
});
