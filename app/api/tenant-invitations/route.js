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

    return Response.json({
      success: true,
      message: "Tenant invitation created.",
      invitation,
      inviteUrl,
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
