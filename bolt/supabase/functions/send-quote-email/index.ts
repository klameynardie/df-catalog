import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerMessage?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const recipientEmail = Deno.env.get("QUOTE_RECIPIENT_EMAIL");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!recipientEmail) {
      throw new Error("QUOTE_RECIPIENT_EMAIL is not configured");
    }

    const requestData: QuoteEmailRequest = await req.json();

    const itemsList = requestData.items
      .map(item => `- ${item.name} (Quantité: ${item.quantity})`)
      .join("\n");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; color: #000; }
            .item-list { background-color: #fff; padding: 15px; border-left: 3px solid #000; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nouvelle demande de devis</h1>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">Informations client</div>
                <p><strong>Nom:</strong> ${requestData.customerName}</p>
                <p><strong>Email:</strong> ${requestData.customerEmail}</p>
                ${requestData.customerPhone ? `<p><strong>Téléphone:</strong> ${requestData.customerPhone}</p>` : ""}
              </div>

              ${requestData.customerMessage ? `
              <div class="section">
                <div class="section-title">Message</div>
                <p>${requestData.customerMessage.replace(/\n/g, "<br>")}</p>
              </div>
              ` : ""}

              <div class="section">
                <div class="section-title">Produits sélectionnés</div>
                <div class="item-list">
                  ${itemsList.replace(/\n/g, "<br>")}
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Cette demande a été envoyée depuis le site web Deco Flamme</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Deco Flamme <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Nouvelle demande de devis - ${requestData.customerName}`,
        html: emailHtml,
        reply_to: requestData.customerEmail,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
