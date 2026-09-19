import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function publicClient(accessToken) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    accessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {},
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/*
=========================================================
POST
Landlord creates an invitation
=========================================================
*/

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "You must be signed in." },
        { status: 401 },
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const supabase = publicClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        { error: "Your session has expired. Please sign in again." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const propertyId = body.propertyId;
    const tenantName = body.tenantName?.trim();
    const tenantEmail = body.tenantEmail?.trim().toLowerCase();

    if (!propertyId || !tenantName || !tenantEmail) {
      return Response.json(
        {
          error:
            "Property, tenant name, and tenant email are required.",
        },
        { status: 400 },
      );
    }

    /*
     * Verify that the signed-in landlord owns this property.
     */
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, address")
      .eq("id", propertyId)
      .eq("landlord_id", user.id)
      .maybeSingle();

    if (propertyError) {
      return Response.json(
        { error: propertyError.message },
        { status: 400 },
      );
    }

    if (!property) {
      return Response.json(
        {
          error:
            "You do not have permission to invite a tenant to this property.",
        },
        { status: 403 },
      );
    }

    /*
     * Create a cryptographically secure invitation token.
     *
     * The raw token goes into the invitation URL.
     * Only its SHA-256 hash is stored in Supabase.
     */
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(inviteToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: invitation, error: inviteError } = await supabase
      .from("tenant_invitations")
      .insert({
        landlord_id: user.id,
        property_id: propertyId,
        tenant_email: tenantEmail,
        tenant_name: tenantName,
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .select(
        "id, landlord_id, property_id, tenant_email, tenant_name, status, expires_at",
      )
      .single();

    if (inviteError) {
      return Response.json(
        { error: inviteError.message },
        { status: 400 },
      );
    }

   const origin = new URL(request.url).origin;

const inviteUrl =
  `${origin}/tenant-invite?token=${encodeURIComponent(inviteToken)}`;

/*
=========================================================
SEND TENANT INVITATION EMAIL
=========================================================
*/

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is missing.");

  return Response.json(
    {
      error:
        "The invitation was created, but email delivery is not configured.",
    },
    { status: 500 },
  );
}

const safeTenantName = tenantName
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const safeAddress = (property.address || "your rental property")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const emailResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",

  headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    /*
     * We will replace this with your Unitvero domain email
     * after the domain is verified in Resend.
     */
    from: "Unitvero <onboarding@resend.dev>",

    to: [tenantEmail],

    subject: `${tenantName}, you've been invited to Unitvero`,

    html: `
      <!doctype html>
      <html>
        <body
          style="
            margin:0;
            padding:0;
            background:#f4f8f6;
            font-family:Arial,Helvetica,sans-serif;
            color:#183b32;
          "
        >
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="padding:40px 16px;"
          >
            <tr>
              <td align="center">

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    max-width:600px;
                    background:#ffffff;
                    border:1px solid #e3ebe8;
                    border-radius:18px;
                    overflow:hidden;
                  "
                >

                  <tr>
                    <td
                      style="
                        padding:32px 36px 18px;
                      "
                    >
                      <div
                        style="
                          font-size:18px;
                          font-weight:800;
                          letter-spacing:3px;
                          color:#173f35;
                        "
                      >
                        UNITVERO
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 36px 36px;">

                      <div
                        style="
                          display:inline-block;
                          padding:7px 11px;
                          background:#eaf7f3;
                          color:#27836b;
                          border-radius:999px;
                          font-size:11px;
                          font-weight:700;
                          letter-spacing:1px;
                        "
                      >
                        TENANT INVITATION
                      </div>

                      <h1
                        style="
                          margin:18px 0 12px;
                          font-size:30px;
                          line-height:1.2;
                          color:#173f35;
                        "
                      >
                        Welcome, ${safeTenantName}
                      </h1>

                      <p
                        style="
                          margin:0 0 22px;
                          color:#667a74;
                          line-height:1.7;
                          font-size:15px;
                        "
                      >
                        Your landlord has invited you to Unitvero,
                        where you can securely access information
                        connected to your rental.
                      </p>

                      <div
                        style="
                          background:#f7faf9;
                          border:1px solid #e5ece9;
                          border-radius:12px;
                          padding:18px;
                          margin-bottom:25px;
                        "
                      >
                        <div
                          style="
                            font-size:12px;
                            color:#788a84;
                            margin-bottom:6px;
                          "
                        >
                          PROPERTY
                        </div>

                        <div
                          style="
                            font-size:16px;
                            font-weight:700;
                            color:#173f35;
                          "
                        >
                          ${safeAddress}
                        </div>
                      </div>

                      <a
                        href="${inviteUrl}"
                        style="
                          display:inline-block;
                          background:#2a8b72;
                          color:#ffffff;
                          text-decoration:none;
                          padding:14px 24px;
                          border-radius:10px;
                          font-size:15px;
                          font-weight:700;
                        "
                      >
                        Accept Invitation
                      </a>

                      <p
                        style="
                          margin:25px 0 0;
                          color:#8a9894;
                          line-height:1.6;
                          font-size:12px;
                        "
                      >
                        This secure invitation expires in 7 days and
                        is tied to ${tenantEmail}.
                      </p>

                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
});

const emailResult = await emailResponse.json();

if (!emailResponse.ok) {
  console.error("Resend email error:", emailResult);

  return Response.json(
    {
      error:
        emailResult?.message ||
        "The invitation was created, but the email could not be sent.",
    },
    { status: 500 },
  );
}

return Response.json({
  success: true,
  message: "Tenant invitation created and email sent.",
  invitation,
  emailSent: true,
});
  } catch (error) {
    console.error("Create tenant invitation error:", error);

    return Response.json(
      {
        error: "Something went wrong creating the invitation.",
      },
      { status: 500 },
    );
  }
}

/*
=========================================================
GET
Check whether an invitation token is valid.

Example:
 /api/tenant-invitations?token=ABC123
=========================================================
*/

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return Response.json(
        { error: "Invitation token is missing." },
        { status: 400 },
      );
    }

    const supabase = publicClient();
    const tokenHash = hashToken(token);

    const { data: invitation, error } = await supabase
      .from("tenant_invitations")
      .select(
        `
        id,
        property_id,
        tenant_email,
        tenant_name,
        status,
        expires_at,
        accepted_at
        `,
      )
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400 },
      );
    }

    if (!invitation) {
      return Response.json(
        { error: "This invitation is invalid." },
        { status: 404 },
      );
    }

    if (invitation.status === "accepted") {
      return Response.json(
        {
          error: "This invitation has already been accepted.",
          status: "accepted",
        },
        { status: 409 },
      );
    }

    if (
      invitation.expires_at &&
      new Date(invitation.expires_at).getTime() < Date.now()
    ) {
      return Response.json(
        {
          error: "This invitation has expired.",
          status: "expired",
        },
        { status: 410 },
      );
    }

    return Response.json({
      success: true,
      invitation: {
        id: invitation.id,
        propertyId: invitation.property_id,
        tenantEmail: invitation.tenant_email,
        tenantName: invitation.tenant_name,
        status: invitation.status,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error("Verify invitation error:", error);

    return Response.json(
      { error: "Could not verify this invitation." },
      { status: 500 },
    );
  }
}

/*
=========================================================
PATCH
Signed-in tenant accepts an invitation.
=========================================================
*/

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        {
          error:
            "Please create an account or sign in before accepting this invitation.",
        },
        { status: 401 },
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const supabase = publicClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        {
          error:
            "Your session expired. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const token = body.token;

    if (!token) {
      return Response.json(
        { error: "Invitation token is missing." },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token);

    const { data: invitation, error: invitationError } =
      await supabase
        .from("tenant_invitations")
        .select(
          `
          id,
          landlord_id,
          property_id,
          tenant_email,
          tenant_name,
          status,
          expires_at,
          accepted_at
          `,
        )
        .eq("token_hash", tokenHash)
        .maybeSingle();

    if (invitationError) {
      return Response.json(
        { error: invitationError.message },
        { status: 400 },
      );
    }

    if (!invitation) {
      return Response.json(
        { error: "This invitation is invalid." },
        { status: 404 },
      );
    }

    if (invitation.status === "accepted") {
      return Response.json(
        { error: "This invitation has already been accepted." },
        { status: 409 },
      );
    }

    if (
      invitation.expires_at &&
      new Date(invitation.expires_at).getTime() < Date.now()
    ) {
      return Response.json(
        { error: "This invitation has expired." },
        { status: 410 },
      );
    }

    /*
     * Critical security check:
     * The signed-in tenant must use the same email address
     * the landlord invited.
     */
    const signedInEmail = user.email?.trim().toLowerCase();
    const invitedEmail =
      invitation.tenant_email?.trim().toLowerCase();

    if (!signedInEmail || signedInEmail !== invitedEmail) {
      return Response.json(
        {
          error:
            `This invitation was sent to ${invitation.tenant_email}. ` +
            "Please sign in using that email address.",
        },
        { status: 403 },
      );
    }

    /*
     * Find the tenancy created by the landlord.
     */
    const { data: tenancy, error: tenancyError } = await supabase
      .from("tenancies")
      .select("*")
      .eq("property_id", invitation.property_id)
      .eq("tenant_email", invitation.tenant_email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tenancyError) {
      return Response.json(
        { error: tenancyError.message },
        { status: 400 },
      );
    }

    if (!tenancy) {
      return Response.json(
        {
          error:
            "The rental record connected to this invitation could not be found.",
        },
        { status: 404 },
      );
    }

    /*
     * Connect this authenticated Supabase user to the tenancy.
     *
     * IMPORTANT:
     * This assumes your tenancies table has a tenant_id column.
     */
    const { error: updateTenancyError } = await supabase
      .from("tenancies")
      .update({
        tenant_id: user.id,
        status: "active",
      })
      .eq("id", tenancy.id);

    if (updateTenancyError) {
      return Response.json(
        {
          error:
            "Could not connect your account to the tenancy: " +
            updateTenancyError.message,
        },
        { status: 400 },
      );
    }

    /*
     * Update the user's profile to tenant.
     */
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "tenant",
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(
        "Tenant profile role update failed:",
        profileError,
      );
    }

    /*
     * Mark invitation accepted so it cannot be reused.
     */
    const acceptedAt = new Date().toISOString();

    const { error: acceptError } = await supabase
      .from("tenant_invitations")
      .update({
        status: "accepted",
        accepted_at: acceptedAt,
      })
      .eq("id", invitation.id)
      .eq("status", "pending");

    if (acceptError) {
      return Response.json(
        {
          error:
            "Your tenancy was connected, but the invitation could not be closed: " +
            acceptError.message,
        },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      message: "Invitation accepted.",
      tenancyId: tenancy.id,
      propertyId: invitation.property_id,
    });
  } catch (error) {
    console.error("Accept tenant invitation error:", error);

    return Response.json(
      {
        error: "Something went wrong accepting this invitation.",
      },
      { status: 500 },
    );
  }
}
