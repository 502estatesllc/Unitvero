import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://unitveroapp.com";

function userClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function adminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
}

function cleanToken(token) {
  if (!token) return "";
  return String(token).trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getSignedInUser(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: "You must be signed in.",
      status: 401,
    };
  }

  const accessToken = authHeader.slice(7).trim();

  if (!accessToken) {
    return {
      error: "You must be signed in.",
      status: 401,
    };
  }

  const supabase = userClient(accessToken);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return {
      error: "Your session has expired. Please sign in again.",
      status: 401,
    };
  }

  return {
    user,
    accessToken,
    supabase,
  };
}

async function findInvitationByToken(token) {
  const cleanedToken = cleanToken(token);

  if (!cleanedToken) {
    return {
      invitation: null,
      error: "Invitation token is missing.",
      status: 400,
    };
  }

  const admin = adminClient();
  const tokenHash = hashToken(cleanedToken);

  const { data, error } = await admin
    .from("applicant_invitations")
    .select(
      `
        id,
        landlord_id,
        property_id,
        unit_id,
        applicant_email,
        applicant_name,
        applicant_phone,
        status,
        expires_at,
        used_at,
        revoked_at
      `,
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("Applicant invitation lookup error:", error);

    return {
      invitation: null,
      error: "Could not verify this invitation.",
      status: 500,
    };
  }

  if (!data) {
    return {
      invitation: null,
      error: "This invitation is invalid.",
      status: 404,
    };
  }

  if (data.used_at) {
    return {
      invitation: data,
      error: "This invitation has already been used.",
      status: 409,
    };
  }

  if (data.revoked_at) {
    return {
      invitation: data,
      error: "This invitation has been revoked.",
      status: 410,
    };
  }

  if (
    data.expires_at &&
    new Date(data.expires_at).getTime() < Date.now()
  ) {
    return {
      invitation: data,
      error: "This invitation has expired.",
      status: 410,
    };
  }

  if (data.status && data.status !== "pending") {
    return {
      invitation: data,
      error: "This invitation is no longer available.",
      status: 409,
    };
  }

  return {
    invitation: data,
    error: null,
    status: 200,
  };
}

export async function POST(request) {
  try {
    const auth = await getSignedInUser(request);

    if (auth.error) {
      return Response.json(
        { error: auth.error },
        { status: auth.status },
      );
    }

    const { user, supabase } = auth;
    const body = await request.json();

    const propertyId = body.propertyId;
    const unitId = body.unitId || null;
    const applicantName = body.applicantName?.trim();
    const applicantEmail = body.applicantEmail?.trim().toLowerCase();
    const applicantPhone = body.applicantPhone?.trim() || null;

    if (!propertyId || !applicantName || !applicantEmail) {
      return Response.json(
        {
          error:
            "Property, applicant name, and applicant email are required.",
        },
        { status: 400 },
      );
    }

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
            "You do not have permission to invite an applicant to this property.",
        },
        { status: 403 },
      );
    }

    if (unitId) {
      const { data: unit, error: unitError } = await supabase
        .from("units")
        .select("id")
        .eq("id", unitId)
        .eq("property_id", propertyId)
        .eq("landlord_id", user.id)
        .maybeSingle();

      if (unitError) {
        return Response.json(
          { error: unitError.message },
          { status: 400 },
        );
      }

      if (!unit) {
        return Response.json(
          {
            error:
              "You do not have permission to invite an applicant to that unit.",
          },
          { status: 403 },
        );
      }
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(inviteToken);
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const admin = adminClient();
    const { data: invitation, error: inviteError } = await admin
      .from("applicant_invitations")
      .insert({
        landlord_id: user.id,
        property_id: propertyId,
        unit_id: unitId || null,
        applicant_email: applicantEmail,
        applicant_name: applicantName,
        applicant_phone: applicantPhone,
        token_hash: tokenHash,
        status: "pending",
        expires_at: expiresAt,
      })
      .select(
        `
          id,
          landlord_id,
          property_id,
          unit_id,
          applicant_email,
          applicant_name,
          applicant_phone,
          status,
          expires_at
        `,
      )
      .single();

    if (inviteError) {
      console.error("Applicant invite insert error:", inviteError);

      return Response.json(
        { error: inviteError.message },
        { status: 400 },
      );
    }

    const inviteUrl =
      `${APP_URL.replace(/\/$/, "")}` +
      `/applicant-invite?token=${encodeURIComponent(inviteToken)}`;

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing.");

      await admin
        .from("applicant_invitations")
        .delete()
        .eq("id", invitation.id);

      return Response.json(
        {
          error: "Email delivery is not configured.",
        },
        { status: 500 },
      );
    }

    const safeApplicantName = escapeHtml(applicantName);
    const safeAddress = escapeHtml(
      property.address || "your rental property",
    );
    const safeEmail = escapeHtml(applicantEmail);

    const emailResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Unitvero <invites@unitveroapp.com>",
          to: [applicantEmail],
          subject: `${applicantName}, your rental application invite is ready`,
          html: `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8f6;font-family:Arial,Helvetica,sans-serif;color:#183b32;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e3ebe8;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:32px 36px 18px;">
                <div style="font-size:18px;font-weight:800;letter-spacing:3px;color:#173f35;">UNITVERO</div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 36px 36px;">
                <div style="display:inline-block;padding:7px 11px;background:#eaf7f3;color:#27836b;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:1px;">APPLICATION INVITATION</div>
                <h1 style="margin:18px 0 12px;font-size:30px;line-height:1.2;color:#173f35;">Complete your application, ${safeApplicantName}</h1>
                <p style="margin:0 0 22px;color:#667a74;line-height:1.7;font-size:15px;">Your landlord has invited you to complete a rental application for ${safeAddress}. Use the secure link below to submit your information without creating a Unitvero account.</p>
                <div style="background:#f7faf9;border:1px solid #e5ece9;border-radius:12px;padding:18px;margin-bottom:25px;">
                  <div style="font-size:12px;color:#788a84;margin-bottom:6px;">PROPERTY</div>
                  <div style="font-size:16px;font-weight:700;color:#173f35;">${safeAddress}</div>
                </div>
                <a href="${inviteUrl}" style="display:inline-block;background:#2a8b72;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;">Complete Application</a>
                <p style="margin:25px 0 0;color:#8a9894;line-height:1.6;font-size:12px;">This secure invitation expires in 7 days and is tied to ${safeEmail}.</p>
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
      },
    );

    let emailResult = {};

    try {
      emailResult = await emailResponse.json();
    } catch {
      emailResult = {};
    }

    if (!emailResponse.ok) {
      console.error("Resend applicant email error:", emailResult);

      await admin
        .from("applicant_invitations")
        .delete()
        .eq("id", invitation.id);

      return Response.json(
        {
          error:
            emailResult?.message ||
            "The invitation email could not be sent.",
        },
        { status: 500 },
      );
    }

    return Response.json({
      success: true,
      message: "Applicant invitation created and email sent.",
      invitation,
      emailSent: true,
    });
  } catch (error) {
    console.error("Create applicant invitation error:", error);

    return Response.json(
      {
        error: "Something went wrong creating the invitation.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = cleanToken(url.searchParams.get("token"));
    const result = await findInvitationByToken(token);

    if (result.error) {
      return Response.json(
        {
          error: result.error,
          status: result.invitation?.status || null,
        },
        { status: result.status },
      );
    }

    const invitation = result.invitation;

    return Response.json({
      success: true,
      invitation: {
        id: invitation.id,
        propertyId: invitation.property_id,
        unitId: invitation.unit_id,
        applicantEmail: invitation.applicant_email,
        applicantName: invitation.applicant_name,
        applicantPhone: invitation.applicant_phone,
        status: invitation.status,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error("Verify applicant invitation error:", error);

    return Response.json(
      {
        error: "Could not verify this invitation.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const action = String(body.action || "submit").toLowerCase();

    if (action === "revoke") {
      const auth = await getSignedInUser(request);

      if (auth.error) {
        return Response.json(
          { error: auth.error },
          { status: auth.status },
        );
      }

      const invitationId = cleanToken(body.invitationId);

      if (!invitationId) {
        return Response.json(
          { error: "Invitation ID is required." },
          { status: 400 },
        );
      }

      const admin = adminClient();
      const { data: invitation, error: lookupError } = await admin
        .from("applicant_invitations")
        .select("id, landlord_id, status, used_at, revoked_at")
        .eq("id", invitationId)
        .maybeSingle();

      if (lookupError) {
        console.error("Applicant invitation lookup error:", lookupError);
        return Response.json(
          { error: lookupError.message },
          { status: 400 },
        );
      }

      if (!invitation) {
        return Response.json(
          { error: "This invitation was not found." },
          { status: 404 },
        );
      }

      if (invitation.landlord_id !== auth.user.id) {
        return Response.json(
          { error: "You do not have permission to revoke this invitation." },
          { status: 403 },
        );
      }

      if (invitation.used_at || invitation.revoked_at || invitation.status !== "pending") {
        return Response.json(
          { error: "This invitation cannot be revoked." },
          { status: 409 },
        );
      }

      const { error: updateError } = await admin
        .from("applicant_invitations")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
        })
        .eq("id", invitation.id)
        .eq("landlord_id", auth.user.id)
        .eq("status", "pending")
        .eq("revoked_at", null)
        .eq("used_at", null);

      if (updateError) {
        console.error("Applicant invitation revoke error:", updateError);
        return Response.json(
          { error: updateError.message },
          { status: 400 },
        );
      }

      return Response.json({
        success: true,
        message: "Applicant invitation revoked.",
      });
    }

    if (action === "resend") {
      const auth = await getSignedInUser(request);

      if (auth.error) {
        return Response.json(
          { error: auth.error },
          { status: auth.status },
        );
      }

      const invitationId = cleanToken(body.invitationId);

      if (!invitationId) {
        return Response.json(
          { error: "Invitation ID is required." },
          { status: 400 },
        );
      }

      const admin = adminClient();
      const { data: invitation, error: lookupError } = await admin
        .from("applicant_invitations")
        .select(
          `
            id,
            landlord_id,
            property_id,
            applicant_email,
            applicant_name,
            applicant_phone,
            status,
            used_at,
            revoked_at,
            expires_at,
            created_at
          `,
        )
        .eq("id", invitationId)
        .maybeSingle();

      if (lookupError) {
        console.error("Applicant invitation lookup error:", lookupError);
        return Response.json(
          { error: lookupError.message },
          { status: 400 },
        );
      }

      if (!invitation) {
        return Response.json(
          { error: "This invitation was not found." },
          { status: 404 },
        );
      }

      if (invitation.landlord_id !== auth.user.id) {
        return Response.json(
          { error: "You do not have permission to resend this invitation." },
          { status: 403 },
        );
      }

      if (invitation.used_at || invitation.revoked_at || invitation.status !== "pending") {
        return Response.json(
          { error: "This invitation cannot be resent." },
          { status: 409 },
        );
      }

      const { data: property, error: propertyError } = await admin
        .from("properties")
        .select("id, address")
        .eq("id", invitation.property_id)
        .eq("landlord_id", auth.user.id)
        .maybeSingle();

      if (propertyError) {
        return Response.json(
          { error: propertyError.message },
          { status: 400 },
        );
      }

      if (!property) {
        return Response.json(
          { error: "This invitation no longer belongs to a valid property." },
          { status: 403 },
        );
      }

      const newInviteToken = crypto.randomBytes(32).toString("hex");
      const newTokenHash = hashToken(newInviteToken);
      const nextExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error: updateError } = await admin
        .from("applicant_invitations")
        .update({
          token_hash: newTokenHash,
          status: "pending",
          expires_at: nextExpiresAt,
          used_at: null,
          revoked_at: null,
        })
        .eq("id", invitation.id)
        .eq("landlord_id", auth.user.id)
        .eq("status", "pending")
        .is("used_at", null)
        .is("revoked_at", null);

      if (updateError) {
        console.error("Applicant invitation resend update error:", updateError);
        return Response.json(
          { error: updateError.message },
          { status: 400 },
        );
      }

      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing.");
        return Response.json(
          { error: "Email delivery is not configured." },
          { status: 500 },
        );
      }

      const inviteUrl =
        `${APP_URL.replace(/\/$/, "")}` +
        `/applicant-invite?token=${encodeURIComponent(newInviteToken)}`;

      const safeApplicantName = escapeHtml(invitation.applicant_name);
      const safeAddress = escapeHtml(property.address || "your rental property");
      const safeEmail = escapeHtml(invitation.applicant_email);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Unitvero <invites@unitveroapp.com>",
          to: [invitation.applicant_email],
          subject: `${invitation.applicant_name}, your rental application invite is ready`,
          html: `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8f6;font-family:Arial,Helvetica,sans-serif;color:#183b32;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e3ebe8;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:32px 36px 18px;">
                <div style="font-size:18px;font-weight:800;letter-spacing:3px;color:#173f35;">UNITVERO</div>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 36px 36px;">
                <div style="display:inline-block;padding:7px 11px;background:#eaf7f3;color:#27836b;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:1px;">APPLICATION INVITATION</div>
                <h1 style="margin:18px 0 12px;font-size:30px;line-height:1.2;color:#173f35;">Complete your application, ${safeApplicantName}</h1>
                <p style="margin:0 0 22px;color:#667a74;line-height:1.7;font-size:15px;">Your landlord has invited you to complete a rental application for ${safeAddress}. Use the secure link below to submit your information without creating a Unitvero account.</p>
                <div style="background:#f7faf9;border:1px solid #e5ece9;border-radius:12px;padding:18px;margin-bottom:25px;">
                  <div style="font-size:12px;color:#788a84;margin-bottom:6px;">PROPERTY</div>
                  <div style="font-size:16px;font-weight:700;color:#173f35;">${safeAddress}</div>
                </div>
                <a href="${inviteUrl}" style="display:inline-block;background:#2a8b72;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;">Complete Application</a>
                <p style="margin:25px 0 0;color:#8a9894;line-height:1.6;font-size:12px;">This secure invitation expires in 7 days and is tied to ${safeEmail}.</p>
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

      let emailResult = {};

      try {
        emailResult = await emailResponse.json();
      } catch {
        emailResult = {};
      }

      if (!emailResponse.ok) {
        console.error("Resend applicant email error:", emailResult);
        return Response.json(
          {
            error: emailResult?.message || "The invitation email could not be sent.",
          },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        message: "Applicant invitation resent.",
      });
    }

    const token = cleanToken(body.token);
    const result = await findInvitationByToken(token);

    if (result.error) {
      return Response.json(
        { error: result.error },
        { status: result.status },
      );
    }

    const invitation = result.invitation;
    const applicantName = String(body.applicantName || "").trim();
    const applicantEmail = String(body.applicantEmail || "")
      .trim()
      .toLowerCase();

    if (!applicantName || !applicantEmail) {
      return Response.json(
        {
          error: "Applicant name and email are required.",
        },
        { status: 400 },
      );
    }

    if (
      applicantEmail !== (invitation.applicant_email || "").toLowerCase()
    ) {
      return Response.json(
        {
          error:
            `This invitation was sent to ${invitation.applicant_email}. Please use that email address.`,
        },
        { status: 403 },
      );
    }

    const applicationRecord = {
      landlord_id: invitation.landlord_id,
      property_id: invitation.property_id,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: String(body.applicantPhone || "").trim() || null,
      current_address: String(body.currentAddress || "").trim() || null,
      current_city: String(body.currentCity || "").trim() || null,
      current_state: String(body.currentState || "").trim() || null,
      current_zip: String(body.currentZip || "").trim() || null,
      employer_name: String(body.employerName || "").trim() || null,
      job_title: String(body.jobTitle || "").trim() || null,
      monthly_income: body.monthlyIncome
        ? Number(body.monthlyIncome)
        : null,
      current_landlord_name:
        String(body.currentLandlordName || "").trim() || null,
      current_landlord_phone:
        String(body.currentLandlordPhone || "").trim() || null,
      current_rent: body.currentRent ? Number(body.currentRent) : null,
      previous_address: String(body.previousAddress || "").trim() || null,
      occupants_count: Number(body.occupantsCount || 1),
      occupants_details: String(body.occupantsDetails || "").trim() || null,
      has_pets: Boolean(body.hasPets === "yes"),
      pets_details:
        body.hasPets === "yes"
          ? String(body.petsDetails || "").trim() || null
          : null,
      vehicles_details: String(body.vehiclesDetails || "").trim() || null,
      application_status: "new",
      screening_status: "not_started",
    };

    const admin = adminClient();
    const { data: application, error: insertError } = await admin
      .from("rental_applications")
      .insert(applicationRecord)
      .select("id")
      .single();

    if (insertError) {
      console.error("Applicant application insert error:", insertError);
      return Response.json(
        {
          error: "Could not save your application: " + insertError.message,
        },
        { status: 400 },
      );
    }

    const { error: updateError } = await admin
      .from("applicant_invitations")
      .update({
        status: "accepted",
        used_at: new Date().toISOString(),
      })
      .eq("id", invitation.id)
      .eq("status", "pending");

    if (updateError) {
      console.error("Applicant invitation close error:", updateError);
    }

    return Response.json({
      success: true,
      message: "Application submitted successfully.",
      applicationId: application?.id || null,
    });
  } catch (error) {
    console.error("Accept applicant invitation error:", error);

    return Response.json(
      {
        error: "Something went wrong submitting your application.",
      },
      { status: 500 },
    );
  }
}
