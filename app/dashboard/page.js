'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [props, setProps] = useState([]);
  const [address, setAddress] = useState('');
  const [view, setView] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const r = useRouter();

  async function load() {
    const s = supabase();

    const {
      data: { user },
      error: userError
    } = await s.auth.getUser();

    if (userError || !user) {
      alert('Auth error: ' + (userError?.message || 'No user found'));
      return;
    }

    const { data: p } = await s
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(
      p || {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        role: user.user_metadata?.role || 'landlord'
      }
    );

    const { data: properties, error } = await s
      .from('properties')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      alert('Could not load properties: ' + error.message);
      return;
    }

    setProps(properties || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();

    const s = supabase();

    const {
      data: { user },
      error: userError
    } = await s.auth.getUser();

    if (userError || !user) {
      alert(
        'Authentication error: ' +
          (userError?.message || 'No user found')
      );
      return;
    }

    const { error } = await s.from('properties').insert({
      landlord_id: user.id,
      address: address,
      city: 'Louisville',
      state: 'KY',
      zip_code: '40211',
      monthly_rent: 0
    });

    if (error) {
      alert('Could not add property: ' + error.message);
      return;
    }

    alert('Property added successfully!');
    setAddress('');
    await load();
  }

  async function saveProperty() {
  const rentInput = document.getElementById('editRent');
  const monthlyRent = Number(rentInput.value);

  const s = supabase();

  const { data, error } = await s
    .from('properties')
    .update({
      monthly_rent: monthlyRent
    })
    
    .eq('id', selectedProperty.id)
    .select()
    .maybeSingle();

  if (error) {
    alert('Could not update property: ' + error.message);
    return;
  }

  setSelectedProperty(data);
  await load();
  alert('Property updated successfully!');
  setView('propertyDetails');
}
  async function loadTenancy(propertyId) {
  const s = supabase();

  const { data, error } = await s
    .from('tenancies')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (error) {
    alert('Could not load tenant: ' + error.message);
    return;
  }

  setSelectedTenancy(data || null);
}
  async function out() {
    await supabase().auth.signOut();
    r.push('/login');
  }

  return (
    <div className="app">
      <aside className="sidebar">
  <div className="sidebarBrand">
    <b className="logo">
      rent<span>wise</span>
    </b>
    <span className="brandLabel">PROPERTY MANAGEMENT</span>
  </div>

  <nav className="sidebarNav">
    <span className="navSection">WORKSPACE</span>

    <a
      className={view === 'overview' ? 'active' : ''}
      onClick={() => setView('overview')}
    >
      <span className="navIcon">⌂</span>
      <span>Overview</span>
    </a>

    <a
      className={
        view === 'properties' ||
        view === 'propertyDetails' ||
        view === 'editProperty'
          ? 'active'
          : ''
      }
      onClick={() => setView('properties')}
    >
      <span className="navIcon">▦</span>
      <span>Properties</span>
    </a>

    <a
      className={view === 'tenants' ? 'active' : ''}
      onClick={() => setView('tenants')}
    >
      <span className="navIcon">♙</span>
      <span>Tenants</span>
    </a>

    <a
      className={view === 'rent' ? 'active' : ''}
      onClick={() => setView('rent')}
    >
      <span className="navIcon">$</span>
      <span>Rent</span>
    </a>

    <span className="navSection navSectionSecond">MANAGEMENT</span>

    <a
      className={view === 'leases' ? 'active' : ''}
      onClick={() => setView('leases')}
    >
      <span className="navIcon">▤</span>
      <span>Leases</span>
    </a>

    <a
      className={view === 'maintenance' ? 'active' : ''}
      onClick={() => setView('maintenance')}
    >
      <span className="navIcon">◇</span>
      <span>Maintenance</span>
    </a>
  </nav>

  <div className="sidebarAccount">
    <div className="accountAvatar">
      {profile?.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : 'L'}
    </div>

    <div className="accountInfo">
      <b>{profile?.full_name || 'Landlord'}</b>
      <span>{profile?.role || 'Landlord'}</span>
    </div>

    <button type="button" onClick={out} title="Sign out">
      ↗
    </button>
  </div>
</aside>

      <main className="dash">
        {view === 'overview' && (
  <>
    <div className="dashboardHeader">
      <div>
        <small>LANDLORD DASHBOARD</small>
        <h1>
          Good to see you
          {profile?.full_name
            ? ', ' + profile.full_name.split(' ')[0]
            : ''}
          .
        </h1>
        <p className="dashboardSubtitle">
          Here&apos;s what&apos;s happening with your portfolio.
        </p>
      </div>

      <button
        type="button"
        className="primary"
        onClick={() => setView('properties')}
      >
        + Add Property
      </button>
    </div>

    <div className="overviewStats">
      <article>
        <span>Total Properties</span>
        <b>{props.length}</b>
        <small>PORTFOLIO</small>
      </article>

      <article>
        <span>Occupied Units</span>
        <b>0</b>
        <small>TENANTS</small>
      </article>

      <article>
        <span>Monthly Rent</span>
        <b>
          ${props
            .reduce(
              (total, property) =>
                total + Number(property.monthly_rent || 0),
              0
            )
            .toLocaleString()}
        </b>
        <small>EXPECTED</small>
      </article>

      <article>
        <span>Outstanding</span>
        <b>$0</b>
        <small>THIS MONTH</small>
      </article>
    </div>

   <div className="dashboardContentGrid">
  <section className="propertiesShowcase">
    <div className="showcaseHeader">
      <div>
        <h2>Your Properties</h2>
        <p>Quick view of your rental portfolio.</p>
      </div>

      <button
        type="button"
        className="viewAllButton"
        onClick={() => setView('properties')}
      >
        View All
      </button>
    </div>

    <div className="dashboardProperties">
      {props.length === 0 && (
        <div className="noProperties">
          <div className="propertyPlaceholderIcon">⌂</div>
          <b>No properties yet</b>
          <span>Add your first property to get started.</span>
        </div>
      )}

      {props.slice(0, 3).map(p => (
        <article
          className="dashboardPropertyCard"
          key={p.id}
          onClick={() => {
  setSelectedProperty(p);
  loadTenancy(p.id);
  setView('propertyDetails');
}}
        >
          <div className="propertyPhoto">
  {p.image_url ? (
    <img src={p.image_url} alt={p.address} />
  ) : (
    <div className="propertyPhotoPlaceholder">
      <span>⌂</span>
      <small>ADD PROPERTY PHOTO</small>
    </div>
  )}

  <label
  className="photoUploadButton"
  onClick={e => e.stopPropagation()}
>
    {p.image_url ? 'Change Photo' : '+ Add Photo'}
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        const s = supabase();

        const filePath =
          `${p.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        const { error: uploadError } = await s.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          alert('Could not upload photo: ' + uploadError.message);
          return;
        }

        const { data: publicData } = s.storage
          .from('property-images')
          .getPublicUrl(filePath);

        const imageUrl = publicData.publicUrl;

        const { error: updateError } = await s
          .from('properties')
          .update({ image_url: imageUrl })
          .eq('id', p.id);

        if (updateError) {
          alert('Photo uploaded, but could not save it: ' + updateError.message);
          return;
        }

        await load();
        alert('Property photo updated successfully!');
      }}
    />
  </label>

  <span className="occupancyBadge">Active</span>
</div>

          <div className="propertyCardBody">
            <div className="propertyCardTop">
              <div>
                <h3>{p.address}</h3>
                <p>
                  {p.city}, {p.state} {p.zip_code}
                </p>
              </div>

              <span className="propertyMenu">•••</span>
            </div>

            <div className="propertyRent">
              ${Number(p.monthly_rent || 0).toLocaleString()}
              <span>/mo</span>
            </div>

            <div className="propertyMeta">
              <span>Rental Property</span>
              <span>View details →</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>

  <section className="activityShowcase">
    <div className="showcaseHeader">
      <div>
        <h2>Recent Activity</h2>
        <p>Latest updates from your portfolio.</p>
      </div>
    </div>

    <div className="activityList">
      <div className="activityRow">
        <div className="activityTypeIcon">$</div>
        <div>
          <b>Rent collection</b>
          <span>Payments will appear here</span>
        </div>
        <small>Current</small>
      </div>

      <div className="activityRow">
        <div className="activityTypeIcon">⌂</div>
        <div>
          <b>{props.length} properties</b>
          <span>Currently in your portfolio</span>
        </div>
        <small>Portfolio</small>
      </div>

      <div className="activityRow">
        <div className="activityTypeIcon">✓</div>
        <div>
          <b>Account active</b>
          <span>Your Rentwise workspace is ready</span>
        </div>
        <small>Active</small>
      </div>
    </div>
  </section>
</div>

<div className="dashboardBottomGrid">
  <section className="dashboardFeatureCard">
    <div className="featureCardHeader">
      <div>
        <h2>Rent Collection</h2>
        <p>This month&apos;s performance</p>
      </div>
    </div>

    <div className="rentCollectionContent">
      <div className="rentCircle">
        <div>
          <b>0%</b>
          <span>Collected</span>
        </div>
      </div>

      <div className="rentLegend">
        <div>
          <span className="legendDot collected"></span>
          <span>Collected</span>
          <b>$0</b>
        </div>

        <div>
          <span className="legendDot pending"></span>
          <span>Expected</span>
          <b>
            ${props
              .reduce(
                (total, property) =>
                  total + Number(property.monthly_rent || 0),
                0
              )
              .toLocaleString()}
          </b>
        </div>
      </div>
    </div>
  </section>

  <section className="dashboardFeatureCard">
    <div className="featureCardHeader">
      <div>
        <h2>Lease Renewals</h2>
        <p>Upcoming lease activity</p>
      </div>
    </div>

    <div className="featureEmpty">
      <div className="featureEmptyIcon">▤</div>
      <b>No renewals scheduled</b>
      <span>Upcoming lease renewals will appear here.</span>
    </div>
  </section>

  <section className="dashboardFeatureCard">
    <div className="featureCardHeader">
      <div>
        <h2>Maintenance</h2>
        <p>Active requests</p>
      </div>
    </div>

    <div className="featureEmpty">
      <div className="featureEmptyIcon">◇</div>
      <b>0 Open Requests</b>
      <span>You&apos;re all caught up.</span>
    </div>
  </section>
</div>

<section className="portfolioBanner">
  <div>
    <span className="bannerIcon">⌂</span>
    <div>
      <h2>Grow Your Portfolio</h2>
      <p>Add another property and keep building your rental business.</p>
    </div>
  </div>

  <button
    type="button"
    className="primary"
    onClick={() => setView('properties')}
  >
    + Add Property
  </button>
</section>
  </>
)}

        {view === 'properties' && (
          <section className="panel">
            <div>
              <small>PORTFOLIO</small>
              <h1>Properties</h1>
              <p>Add and manage your rental properties.</p>
            </div>

            {profile?.role === 'landlord' && (
              <form className="add" onSubmit={add}>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address"
                  required
                />
                <button type="submit" className="primary">
                  Add property
                </button>
              </form>
            )}

            {props.length === 0 && <p>No properties added yet.</p>}

            {props.map(p => (
              <div
                className="property"
                key={p.id}
                onClick={() => {
                  setSelectedProperty(p);
                  loadTenancy(p.id);
                  setView('propertyDetails');
                }}
                style={{ cursor: 'pointer' }}
              >
                <b>{p.address}</b>
                <span>
                  {p.city}, {p.state} {p.zip_code}
                </span>
              </div>
            ))}
          </section>
        )}

      {view === 'propertyDetails' && selectedProperty && (
  <section className="propertyDetailsPage">
    <button
      type="button"
      className="propertyBackButton"
      onClick={() => setView('properties')}
    >
      ← Back to Properties
    </button>

    <div className="propertyDetailsHero">
      <div className="propertyDetailsImage">
        {selectedProperty.image_url ? (
          <img
            src={selectedProperty.image_url}
            alt={selectedProperty.address}
          />
        ) : (
          <div className="propertyDetailsPlaceholder">⌂</div>
        )}
      </div>

      <div className="propertyDetailsInfo">
        <span className="propertyDetailsLabel">RENTAL PROPERTY</span>

        <h1>{selectedProperty.address}</h1>

        <p>
          {selectedProperty.city}, {selectedProperty.state}{' '}
          {selectedProperty.zip_code}
        </p>

        <span className="propertyStatusBadge">● Active</span>

        <button
          type="button"
          className="primary"
          onClick={() => setView('editProperty')}
        >
          Edit Property
        </button>
      </div>
    </div>

    <div className="propertyDetailsStats">
      <article>
        <span>Monthly Rent</span>
        <b>
          ${Number(selectedProperty.monthly_rent || 0).toLocaleString()}
        </b>
        <small>EXPECTED PER MONTH</small>
      </article>

     <article>
  <span>Occupancy</span>
  <b>{selectedTenancy ? 'Occupied' : 'Vacant'}</b>
  <small>
    {selectedTenancy ? 'ACTIVE TENANT' : 'NO TENANT ASSIGNED'}
  </small>
</article>

      <article>
  <span>Lease</span>
  <b>{selectedTenancy ? 'Active' : '—'}</b>
  <small>
    {selectedTenancy ? 'ACTIVE LEASE' : 'NO ACTIVE LEASE'}
  </small>
</article>

      <article>
        <span>Maintenance</span>
        <b>0</b>
        <small>OPEN REQUESTS</small>
      </article>
    </div>

    <div className="propertyDetailsGrid">
      <section className="propertyDetailsCard">
        <h2>Property Information</h2>

        <div className="propertyInfoRow">
          <span>Address</span>
          <b>{selectedProperty.address}</b>
        </div>

        <div className="propertyInfoRow">
          <span>City</span>
          <b>{selectedProperty.city}</b>
        </div>

        <div className="propertyInfoRow">
          <span>State</span>
          <b>{selectedProperty.state}</b>
        </div>

        <div className="propertyInfoRow">
          <span>ZIP Code</span>
          <b>{selectedProperty.zip_code}</b>
        </div>
      </section>

      <section className="propertyDetailsCard">
        <h2>Current Tenant</h2>

        {selectedTenancy ? (
  <div className="propertyDetailsEmpty">
    <span>♙</span>
    <b>{selectedTenancy.tenant_name || selectedTenancy.tenant_email}</b>
          <p>✉ {selectedTenancy.tenant_email}</p>
          {selectedTenancy.tenant_phone && (
  <p>☎ {selectedTenancy.tenant_phone}</p>
)}
    <p>
      ${Number(selectedTenancy.monthly_rent || 0).toLocaleString()} / month
    </p>
    <p>
  📅 Lease:{' '}
  {selectedTenancy.start_date
    ? new Date(selectedTenancy.start_date + 'T00:00:00').toLocaleDateString()
    : '—'}
  {selectedTenancy.end_date
    ? ' – ' + new Date(selectedTenancy.end_date + 'T00:00:00').toLocaleDateString()
    : ''}
</p> 
    <small>ACTIVE TENANT</small>
  </div>
) : (
  <div className="propertyDetailsEmpty">
    <span>♙</span>
    <b>No tenant assigned</b>
    <p>Add a tenant to begin tracking rent and lease information.</p>
    <button
      type="button"
      className="viewAllButton"
      onClick={() => setView('addTenant')}
    >
      + Add Tenant
    </button>
  </div>
)}
      </section>
    </div>
  </section>
)}  

   {view === 'addTenant' && selectedProperty && (
  <section className="panel">
    <button
      type="button"
      onClick={() => setView('propertyDetails')}
    >
      ← Back to Property
    </button>

    <small>NEW TENANT</small>
    <h1>Add Tenant</h1>
    <p>
      Add a tenant to {selectedProperty.address}.
    </p>

    <form
      className="addTenantForm"
      onSubmit={async e => {
        e.preventDefault();

        const form = e.currentTarget;
        const s = supabase();

        const {
          data: { user },
          error: userError
        } = await s.auth.getUser();

        if (userError || !user) {
          alert('Authentication error.');
          return;
        }

        const tenantName = form.tenantName.value.trim();
        const tenantEmail = form.tenantEmail.value.trim();
        const tenantPhone = form.tenantPhone.value.trim();
        const monthlyRent = Number(form.monthlyRent.value);
        const startDate = form.startDate.value;
        const endDate = form.endDate.value || null;

        const { error: tenancyError } = await s
          .from('tenancies')
          .insert({
            property_id: selectedProperty.id,
            tenant_email: tenantEmail,
            tenant_name: tenantName,
tenant_phone: tenantPhone,
            monthly_rent: monthlyRent,
            start_date: startDate,
            end_date: endDate,
            status: 'active'
          });

        if (tenancyError) {
          alert('Could not add tenant: ' + tenancyError.message);
          return;
        }

        const { error: inviteError } = await s
          .from('invitations')
          .insert({
            landlord_id: user.id,
            property_id: selectedProperty.id,
            email: tenantEmail,
            status: 'pending'
          });

        if (inviteError) {
          alert(
            'Tenant was added, but invitation could not be created: ' +
              inviteError.message
          );
          return;
        }

        alert(
          tenantName +
            ' was added successfully. Invitation created for ' +
            tenantEmail
        );

        form.reset();
        await loadTenancy(selectedProperty.id);
        setView('propertyDetails');
      }}
    >
      <div className="tenantFormGrid">
        <label>
          Full Name
          <input
            name="tenantName"
            type="text"
            placeholder="Tenant full name"
            required
          />
        </label>

        <label>
          Email Address
          <input
            name="tenantEmail"
            type="email"
            placeholder="tenant@email.com"
            required
          />
        </label>

        <label>
          Phone Number
          <input
            name="tenantPhone"
            type="tel"
            placeholder="(502) 555-1234"
          />
        </label>

        <label>
          Monthly Rent
          <input
            name="monthlyRent"
            type="number"
            min="0"
            step="0.01"
            defaultValue={selectedProperty.monthly_rent || ''}
            required
          />
        </label>

        <label>
          Lease Start Date
          <input
            name="startDate"
            type="date"
            required
          />
        </label>

        <label>
          Lease End Date
          <input
            name="endDate"
            type="date"
          />
        </label>
      </div>

      <div className="tenantFormActions">
        <button
          type="button"
          onClick={() => setView('propertyDetails')}
        >
          Cancel
        </button>

        <button type="submit" className="primary">
          Add Tenant & Create Invitation
        </button>
      </div>
    </form>
  </section>
)}  

{view === 'editProperty' && selectedProperty && (
  <section className="panel">
    <button
      type="button"
      onClick={() => setView('propertyDetails')}
    >
      ← Back
    </button>

    <small>EDIT PROPERTY</small>
    <h1>{selectedProperty.address}</h1>

    <p>Edit this property's information.</p>
      <input
  type="number"
  placeholder="Monthly rent"
  defaultValue={selectedProperty.monthly_rent || ''}
  id="editRent"
/>  
    <button
onClick={saveProperty}
  type="button"
  className="primary"
>
  Save Changes
</button>
    
  </section>
)}  
{view === 'tenants' && (
          <section className="panel">
            <h1>Tenants</h1>
            <p>Tenant management is coming next.</p>
          </section>
        )}

        {view === 'rent' && (
          <section className="panel">
            <h1>Rent</h1>
            <p>
              Rent collection and installment requests are coming next.
            </p>
          </section>
        )}

        {view === 'leases' && (
          <section className="panel">
            <h1>Leases</h1>
            <p>Lease management is coming next.</p>
          </section>
        )}

        {view === 'maintenance' && (
          <section className="panel">
            <h1>Maintenance</h1>
            <p>Maintenance requests are coming next.</p>
          </section>
        )}
      </main>
    </div>
  );
}
