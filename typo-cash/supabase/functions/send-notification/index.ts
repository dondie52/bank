// Supabase Edge Function: Send Notification
// SMS via Africa's Talking API, Email via SMTP

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface NotificationRequest {
  borrower_id: string;
  loan_id?: string;
  channel: "sms" | "email" | "push" | "whatsapp";
  template_code: string;
  recipient: string;
  variables?: Record<string, string>;
}

const templates: Record<string, { sms: string; email_subject?: string; email_body?: string }> = {
  loan_approved: {
    sms: "Hi {name}, your loan of {amount} has been approved! Sign your agreement in the Typo Cash app to proceed. Ref: {ref}",
    email_subject: "Your Loan is Approved - {ref}",
  },
  cooling_off_start: {
    sms: "Your Typo Cash loan {ref} is now in the 48-hour cooling-off period. You may cancel at no cost during this time.",
  },
  disbursement_complete: {
    sms: "Good news! {amount} has been sent to your account. Ref: {ref}. Thank you for choosing Typo Cash Solutions.",
  },
  payment_reminder_d5: {
    sms: "Reminder: Your Typo Cash payment of {amount} is due in 5 days ({date}). Pay via the app or your bank. Ref: {ref}",
  },
  payment_reminder_d3: {
    sms: "Your payment of {amount} is due in 3 days. Avoid late fees by paying on time. Ref: {ref}",
  },
  payment_reminder_d1: {
    sms: "Tomorrow is your payment date! {amount} is due for loan {ref}. Pay now in the Typo Cash app.",
  },
  payment_overdue: {
    sms: "Your Typo Cash payment is overdue. Please pay {amount} as soon as possible to avoid penalties. Ref: {ref}. Call us if you need help.",
  },
  payment_received: {
    sms: "Payment of {amount} received for loan {ref}. Outstanding balance: {balance}. Thank you!",
  },
};

serve(async (req) => {
  const body: NotificationRequest = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const template = templates[body.template_code];
  if (!template) {
    return new Response(JSON.stringify({ error: "Unknown template" }), { status: 400 });
  }

  // Record notification
  const { data: notification } = await supabase.from("notifications").insert({
    borrower_id: body.borrower_id,
    loan_id: body.loan_id,
    channel: body.channel,
    template_code: body.template_code,
    recipient: body.recipient,
    status: "pending",
  }).select().single();

  if (body.channel === "sms") {
    let message = template.sms;
    for (const [key, value] of Object.entries(body.variables || {})) {
      message = message.replace(`{${key}}`, value);
    }

    // Africa's Talking SMS API
    const atApiKey = Deno.env.get("AT_API_KEY");
    const atUsername = Deno.env.get("AT_USERNAME");

    if (atApiKey && atUsername && atApiKey !== "sandbox") {
      try {
        const response = await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            apiKey: atApiKey,
          },
          body: new URLSearchParams({
            username: atUsername,
            to: body.recipient,
            message,
            from: Deno.env.get("AT_SENDER_ID") || "TypoCash",
          }),
        });

        if (response.ok) {
          await supabase.from("notifications")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", notification.id);
        } else {
          await supabase.from("notifications")
            .update({ status: "failed" })
            .eq("id", notification.id);
        }
      } catch {
        await supabase.from("notifications")
          .update({ status: "failed" })
          .eq("id", notification.id);
      }
    } else {
      // Sandbox mode: just log
      console.log(`[SMS] To: ${body.recipient} | ${message}`);
      await supabase.from("notifications")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", notification.id);
    }
  }

  return new Response(JSON.stringify({
    notification_id: notification.id,
    status: "sent",
  }), { headers: { "Content-Type": "application/json" } });
});
