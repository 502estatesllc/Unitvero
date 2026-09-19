import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    // Get the signed-in user's access token
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase client using the same public credentials as the app
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    // Verify who is signed in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Get invitation information from the landlord
    const body = await request.json();

    const propertyId = body.propertyId;
    const tenantName = body.tenantName?.trim();
    const tenantEmail = body.tenantEmail?.trim().toLowerCase();

    if (!propertyId || !tenantName || !tenantEmail) {
      return Response.json(
        { error: 'Property, tenant name, and tenant email are required.' },
        { status: 400 }
      );
    }

    // Make sure this property actually belongs to the signed-in landlord
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('landlord_id', user.id)
      .maybeSingle();

    if (propertyError) {
      return Response.json(
        { error: propertyError.message },
        { status: 400 }
      );
    }

    if (!property) {
      return Response.json(
        { error: 'You do not have permission to invite a tenant to this property.' },
        { status: 403 }
      );
    }

    // Generate a secure invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Only store a hash of the token in the database
    const tokenHash = crypto
      .createHash('sha256')
      .update(inviteToken)
      .digest('hex');

    // Invitation expires in 7 days
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Save invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('tenant_invitations')
      .insert({
        landlord_id: user.id,
        property_id: propertyId,
        tenant_email: tenantEmail,
        tenant_name: tenantName,
        token_hash: tokenHash,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id, tenant_email, tenant_name, property_id, status, expires_at')
      .single();

    if (inviteError) {
      return Response.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    // We will connect this URL to the tenant acceptance page next
    const origin = new URL(request.url).origin;

    const inviteUrl =
      `${origin}/tenant-invite?token=${encodeURIComponent(inviteToken)}`;

    return Response.json({
      success: true,
      message: 'Tenant invitation created.',
      invitation,
      inviteUrl,
    });
  } catch (error) {
    console.error('Tenant invitation error:', error);

    return Response.json(
      { error: 'Something went wrong creating the invitation.' },
      { status: 500 }
    );
  }
}
