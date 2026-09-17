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
const [tenancies, setTenancies] = useState([]);
const [editingTenancy, setEditingTenancy] = useState(null);
const [applications, setApplications] = useState([]);
const [selectedApplication, setSelectedApplication] = useState(null);
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
    const { data: applicationData, error: applicationError } = await s
      .from('rental_applications')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false });

    if (applicationError) {
      alert('Could not load applications: ' + applicationError.message);
    } else {
      setApplications(applicationData || []);
    }
    const propertyIds = (properties || []).map(property => property.id);

    if (propertyIds.length === 0) {
      setTenancies([]);
    } else {
      const { data: tenancyData, error: tenancyError } = await s
        .from('tenancies')
        .select('*')
        .in('property_id', propertyIds);

      if (tenancyError) {
        alert('Could not load tenants: ' + tenancyError.message);
      } else {
        setTenancies(tenancyData || []);
      }
    }
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

  async function saveTenant(e) {
    e.preventDefault();

    if (!editingTenancy) return;

    const form = e.currentTarget;

    const tenantName = form.tenantName.value.trim();
    const tenantEmail = form.tenantEmail.value.trim();
    const tenantPhone = form.tenantPhone.value.trim();
    const monthlyRent = Number(form.monthlyRent.value);
    const startDate = form.startDate.value;
    const endDate = form.endDate.value || null;

    if (endDate && endDate < startDate) {
      alert('Lease end date cannot be before the lease start date.');
      return;
    }

    const s = supabase();

    const { data, error } = await s
      .from('tenancies')
      .update({
        tenant_name: tenantName,
        tenant_email: tenantEmail,
        tenant_phone: tenantPhone,
        monthly_rent: monthlyRent,
        start_date: startDate,
        end_date: endDate
      })
      .eq('id', editingTenancy.id)
      .select()
      .maybeSingle();

    if (error) {
      alert('Could not update tenant: ' + error.message);
      return;
    }

    setEditingTenancy(data);

    if (selectedTenancy?.id === data.id) {
      setSelectedTenancy(data);
    }

    await load();
    alert('Tenant updated successfully!');
    setView('tenants');
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
            className={
              view === 'tenants' || view === 'editTenant'
                ? 'active'
                : ''
            }
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

          <span className="navSection navSectionSecond">
            MANAGEMENT
          </span>

          <a
            className={view === 'leases' ? 'active' : ''}
            onClick={() => setView('leases')}
          >
            <span className="navIcon">▤</span>
            <span>Leases</span>
          </a>
            <a
  className={view === 'applications' ? 'active' : ''}
  onClick={() => setView('applications')}
>
  <span className="navIcon">▣</span>
  <span>Applications</span>
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
                <b>
                  {
                    tenancies.filter(
                      tenancy => tenancy.status === 'active'
                    ).length
                  }
                </b>
                <small>TENANTS</small>
              </article>

              <article>
                <span>Monthly Rent</span>
                <b>
                  $
                  {props
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
                                `${p.id}/${Date.now()}-${file.name.replace(
                                  /\s+/g,
                                  '-'
                                )}`;

                              const { error: uploadError } =
                                await s.storage
                                  .from('property-images')
                                  .upload(filePath, file, {
                                    cacheControl: '3600',
                                    upsert: false
                                  });

                              if (uploadError) {
                                alert(
                                  'Could not upload photo: ' +
                                    uploadError.message
                                );
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
                                alert(
                                  'Photo uploaded, but could not save it: ' +
                                    updateError.message
                                );
                                return;
                              }

                              await load();
                              alert(
                                'Property photo updated successfully!'
                              );
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
                          $
                          {Number(
                            p.monthly_rent || 0
                          ).toLocaleString()}
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
                        $
                        {props
                          .reduce(
                            (total, property) =>
                              total +
                              Number(property.monthly_rent || 0),
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
                  <span>
                    Upcoming lease renewals will appear here.
                  </span>
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
                  <p>
                    Add another property and keep building your
                    rental business.
                  </p>
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
                  <div className="propertyDetailsPlaceholder">
                    ⌂
                  </div>
                )}
              </div>

              <div className="propertyDetailsInfo">
                <span className="propertyDetailsLabel">
                  RENTAL PROPERTY
                </span>

                <h1>{selectedProperty.address}</h1>

                <p>
                  {selectedProperty.city},{' '}
                  {selectedProperty.state}{' '}
                  {selectedProperty.zip_code}
                </p>

                <span className="propertyStatusBadge">
                  ● Active
                </span>

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
                  $
                  {Number(
                    selectedProperty.monthly_rent || 0
                  ).toLocaleString()}
                </b>
                <small>EXPECTED PER MONTH</small>
              </article>

              <article>
                <span>Occupancy</span>
                <b>
                  {selectedTenancy ? 'Occupied' : 'Vacant'}
                </b>
                <small>
                  {selectedTenancy
                    ? 'ACTIVE TENANT'
                    : 'NO TENANT ASSIGNED'}
                </small>
              </article>

              <article>
                <span>Lease</span>
                <b>{selectedTenancy ? 'Active' : '—'}</b>
                <small>
                  {selectedTenancy
                    ? 'ACTIVE LEASE'
                    : 'NO ACTIVE LEASE'}
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

                    <b>
                      {selectedTenancy.tenant_name ||
                        selectedTenancy.tenant_email}
                    </b>

                    <p>✉ {selectedTenancy.tenant_email}</p>

                    {selectedTenancy.tenant_phone && (
                      <p>☎ {selectedTenancy.tenant_phone}</p>
                    )}

                    <p>
                      $
                      {Number(
                        selectedTenancy.monthly_rent || 0
                      ).toLocaleString()}{' '}
                      / month
                    </p>

                    <p>
                      📅 Lease:{' '}
                      {selectedTenancy.start_date
                        ? new Date(
                            selectedTenancy.start_date +
                              'T00:00:00'
                          ).toLocaleDateString()
                        : '—'}

                      {selectedTenancy.end_date
                        ? ' – ' +
                          new Date(
                            selectedTenancy.end_date +
                              'T00:00:00'
                          ).toLocaleDateString()
                        : ''}
                    </p>

                    <small>ACTIVE TENANT</small>
                  </div>
                ) : (
                  <div className="propertyDetailsEmpty">
                    <span>♙</span>
                    <b>No tenant assigned</b>

                    <p>
                      Add a tenant to begin tracking rent and
                      lease information.
                    </p>

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
        {view === 'editProperty' && selectedProperty && (
          <section className="panel">
            <button
              type="button"
              onClick={() => setView('propertyDetails')}
            >
              ← Back to Property
            </button>

            <small>EDIT PROPERTY</small>
            <h1>{selectedProperty.address}</h1>
            <p>Update the rental information for this property.</p>

            <div className="add">
              <input
                id="editRent"
                type="number"
                min="0"
                step="0.01"
                defaultValue={selectedProperty.monthly_rent || 0}
                placeholder="Monthly rent"
              />

              <button
                type="button"
                className="primary"
                onClick={saveProperty}
              >
                Save Changes
              </button>
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
              Add a tenant to {selectedProperty.address} and create
              their invitation.
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
                  alert(
                    'Authentication error: ' +
                      (userError?.message || 'No user found')
                  );
                  return;
                }

                const tenantName =
                  form.tenantName.value.trim();

                const tenantEmail =
                  form.tenantEmail.value.trim();

                const tenantPhone =
                  form.tenantPhone.value.trim();

                const monthlyRent = Number(
                  form.monthlyRent.value
                );

                const startDate = form.startDate.value;
                const endDate = form.endDate.value || null;

                if (endDate && endDate < startDate) {
                  alert(
                    'Lease end date cannot be before the lease start date.'
                  );
                  return;
                }

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
                  alert(
                    'Could not add tenant: ' +
                      tenancyError.message
                  );
                  return;
                }

                const { error: invitationError } = await s
                  .from('invitations')
                  .insert({
                    landlord_id: user.id,
                    property_id: selectedProperty.id,
                    email: tenantEmail,
                    status: 'pending'
                  });

                if (invitationError) {
                  alert(
                    'Tenant was added, but invitation could not be created: ' +
                      invitationError.message
                  );

                  await loadTenancy(selectedProperty.id);
                  await load();
                  setView('propertyDetails');
                  return;
                }

                alert(
                  tenantName +
                    ' was added successfully. Invitation created for ' +
                    tenantEmail
                );

                form.reset();

                await loadTenancy(selectedProperty.id);
                await load();

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
                    defaultValue={
                      selectedProperty.monthly_rent || ''
                    }
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

                <button
                  type="submit"
                  className="primary"
                >
                  Add Tenant & Create Invitation
                </button>
              </div>
            </form>
          </section>
        )}

        {view === 'tenants' && (
  <section className="panel tenantsPage">
    <div className="dashboardHeader">
      <div>
        <small>TENANT MANAGEMENT</small>
        <h1>Tenants</h1>
        <p className="dashboardSubtitle">
          Manage tenants, leases, rent, and occupancy across your portfolio.
        </p>
      </div>
    </div>

    <div className="tenantSummaryGrid">
      <article className="tenantSummaryCard">
        <div className="tenantSummaryIcon">♙</div>
        <div>
          <span>Total Tenants</span>
          <b>{tenancies.length}</b>
          <small>ALL TENANTS</small>
        </div>
      </article>

      <article className="tenantSummaryCard">
        <div className="tenantSummaryIcon">✓</div>
        <div>
          <span>Active Tenants</span>
          <b>
            {
              tenancies.filter(
                tenancy => tenancy.status === 'active'
              ).length
            }
          </b>
          <small>CURRENTLY ACTIVE</small>
        </div>
      </article>

      <article className="tenantSummaryCard">
        <div className="tenantSummaryIcon">⌂</div>
        <div>
          <span>Occupied Properties</span>
          <b>
            {
              new Set(
                tenancies
                  .filter(tenancy => tenancy.status === 'active')
                  .map(tenancy => tenancy.property_id)
              ).size
            }
          </b>
          <small>OF {props.length} PROPERTIES</small>
        </div>
      </article>

      <article className="tenantSummaryCard">
        <div className="tenantSummaryIcon">$</div>
        <div>
          <span>Monthly Rent</span>
          <b>
            $
            {tenancies
              .filter(tenancy => tenancy.status === 'active')
              .reduce(
                (total, tenancy) =>
                  total + Number(tenancy.monthly_rent || 0),
                0
              )
              .toLocaleString()}
          </b>
          <small>ACTIVE TENANCIES</small>
        </div>
      </article>
    </div>

    <section className="tenantDirectory">
      <div className="tenantDirectoryHeader">
        <div>
          <h2>Tenant Directory</h2>
          <p>
            Contact information, property assignment, rent and lease details.
          </p>
        </div>

        <span className="tenantCount">
          {tenancies.length}{' '}
          {tenancies.length === 1 ? 'tenant' : 'tenants'}
        </span>
      </div>

      {tenancies.length === 0 ? (
        <div className="tenantEmptyState">
          <div className="tenantEmptyIcon">♙</div>
          <h3>No tenants yet</h3>
          <p>
            Open one of your properties and add a tenant to begin
            managing their lease and rent information.
          </p>

          <button
            type="button"
            className="primary"
            onClick={() => setView('properties')}
          >
            View Properties
          </button>
        </div>
      ) : (
        <>
          <div className="tenantTableHeader">
            <span>Tenant</span>
            <span>Property</span>
            <span>Monthly Rent</span>
            <span>Lease Term</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="tenantRows">
            {tenancies.map(tenancy => {
              const property = props.find(
                p => p.id === tenancy.property_id
              );

              const initials = (
                tenancy.tenant_name ||
                tenancy.tenant_email ||
                'T'
              )
                .split(' ')
                .map(part => part.charAt(0))
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div className="tenantTableRow" key={tenancy.id}>
                  <div className="tenantIdentity">
                    <div className="tenantAvatar">
                      {initials}
                    </div>

                    <div>
                      <b>
                        {tenancy.tenant_name ||
                          tenancy.tenant_email}
                      </b>

                      <span>{tenancy.tenant_email}</span>

                      {tenancy.tenant_phone && (
                        <small>{tenancy.tenant_phone}</small>
                      )}
                    </div>
                  </div>

                  <div className="tenantPropertyCell">
                    <b>
                      {property?.address || 'Property'}
                    </b>

                    <span>
                      {property
                        ? `${property.city}, ${property.state} ${property.zip_code}`
                        : 'Property information unavailable'}
                    </span>
                  </div>

                  <div className="tenantRentCell">
                    <b>
                      $
                      {Number(
                        tenancy.monthly_rent || 0
                      ).toLocaleString()}
                    </b>
                    <span>per month</span>
                  </div>

                  <div className="tenantLeaseCell">
                    <b>
                      {tenancy.start_date
                        ? new Date(
                            tenancy.start_date + 'T00:00:00'
                          ).toLocaleDateString()
                        : '—'}
                    </b>

                    <span>
                      to{' '}
                      {tenancy.end_date
                        ? new Date(
                            tenancy.end_date + 'T00:00:00'
                          ).toLocaleDateString()
                        : 'No end date'}
                    </span>
                  </div>

                  <div className="tenantStatusCell">
                    <span
                      className={
                        tenancy.status === 'active'
                          ? 'tenantStatus active'
                          : 'tenantStatus'
                      }
                    >
                      <i></i>
                      {tenancy.status === 'active'
                        ? 'Active'
                        : tenancy.status || 'Inactive'}
                    </span>
                  </div>

                  <div className="tenantActionsCell">
                    <button
                      type="button"
                      className="tenantEditButton"
                      onClick={() => {
                        setEditingTenancy(tenancy);
                        setView('editTenant');
                      }}
                    >
                      Edit
                    </button>

                    {property && (
                      <button
                        type="button"
                        className="tenantPropertyButton"
                        onClick={() => {
                          setSelectedProperty(property);
                          loadTenancy(property.id);
                          setView('propertyDetails');
                        }}
                      >
                        Property
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  </section>
)}
    {view === 'editTenant' && editingTenancy && (     
  <section className="panel">
            <button
              type="button"
              onClick={() => setView('tenants')}
            >
              ← Back to Tenants
            </button>

            <small>EDIT TENANT</small>

            <h1>
              {editingTenancy.tenant_name ||
                editingTenancy.tenant_email}
            </h1>

            <p>
              Update tenant contact, rent, and lease information.
            </p>

            <form
              className="addTenantForm"
              onSubmit={saveTenant}
            >
              <div className="tenantFormGrid">
                <label>
                  Full Name
                  <input
                    name="tenantName"
                    type="text"
                    defaultValue={
                      editingTenancy.tenant_name || ''
                    }
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    name="tenantEmail"
                    type="email"
                    defaultValue={
                      editingTenancy.tenant_email || ''
                    }
                    required
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    name="tenantPhone"
                    type="tel"
                    defaultValue={
                      editingTenancy.tenant_phone || ''
                    }
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
                    defaultValue={
                      editingTenancy.monthly_rent || ''
                    }
                    required
                  />
                </label>

                <label>
                  Lease Start Date
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={
                      editingTenancy.start_date || ''
                    }
                    required
                  />
                </label>

                <label>
                  Lease End Date
                  <input
                    name="endDate"
                    type="date"
                    defaultValue={
                      editingTenancy.end_date || ''
                    }
                  />
                </label>
              </div>

              <div className="tenantFormActions">
                <button
                  type="button"
                  onClick={() => setView('tenants')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Save Tenant Changes
                </button>
              </div>
            </form>
          </section>
        )}

        {view === 'rent' && (
          <section className="panel">
            <h1>Rent</h1>
            <p>Rent collection is coming next.</p>
          </section>
        )}

        {view === 'leases' && (
  <section className="panel leasesPage">
    <div className="dashboardHeader">
      <div>
        <small>LEASE MANAGEMENT</small>
        <h1>Leases</h1>
        <p className="dashboardSubtitle">
          Track active agreements, lease terms, rent, and upcoming expirations.
        </p>
      </div>
    </div>

    <div className="leaseSummaryGrid">
      <article className="leaseSummaryCard">
        <div className="leaseSummaryIcon">▤</div>
        <div>
          <span>Total Leases</span>
          <b>{tenancies.length}</b>
          <small>ALL AGREEMENTS</small>
        </div>
      </article>

      <article className="leaseSummaryCard">
        <div className="leaseSummaryIcon">✓</div>
        <div>
          <span>Active Leases</span>
          <b>
            {
              tenancies.filter(
                tenancy => tenancy.status === 'active'
              ).length
            }
          </b>
          <small>CURRENT AGREEMENTS</small>
        </div>
      </article>

      <article className="leaseSummaryCard">
        <div className="leaseSummaryIcon">⌂</div>
        <div>
          <span>Leased Properties</span>
          <b>
            {
              new Set(
                tenancies
                  .filter(tenancy => tenancy.status === 'active')
                  .map(tenancy => tenancy.property_id)
              ).size
            }
          </b>
          <small>OF {props.length} PROPERTIES</small>
        </div>
      </article>

      <article className="leaseSummaryCard">
        <div className="leaseSummaryIcon">$</div>
        <div>
          <span>Monthly Lease Value</span>
          <b>
            $
            {tenancies
              .filter(tenancy => tenancy.status === 'active')
              .reduce(
                (total, tenancy) =>
                  total + Number(tenancy.monthly_rent || 0),
                0
              )
              .toLocaleString()}
          </b>
          <small>ACTIVE RENT</small>
        </div>
      </article>
    </div>

    <section className="leaseDirectory">
      <div className="leaseDirectoryHeader">
        <div>
          <h2>Lease Directory</h2>
          <p>
            Review tenants, properties, rent amounts, and agreement dates.
          </p>
        </div>

        <span className="leaseCount">
          {tenancies.length}{' '}
          {tenancies.length === 1 ? 'lease' : 'leases'}
        </span>
      </div>

      {tenancies.length === 0 ? (
        <div className="leaseEmptyState">
          <div className="leaseEmptyIcon">▤</div>

          <h3>No leases yet</h3>

          <p>
            Lease information will appear here after a tenant is
            assigned to a property.
          </p>

          <button
            type="button"
            className="primary"
            onClick={() => setView('properties')}
          >
            View Properties
          </button>
        </div>
      ) : (
        <>
          <div className="leaseTableHeader">
            <span>Property</span>
            <span>Tenant</span>
            <span>Monthly Rent</span>
            <span>Start Date</span>
            <span>End Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <div className="leaseRows">
            {tenancies.map(tenancy => {
              const property = props.find(
                p => p.id === tenancy.property_id
              );

              return (
                <div
                  className="leaseTableRow"
                  key={tenancy.id}
                >
                  <div className="leasePropertyCell">
                    <div className="leasePropertyIcon">⌂</div>

                    <div>
                      <b>
                        {property?.address || 'Property'}
                      </b>

                      <span>
                        {property
                          ? `${property.city}, ${property.state} ${property.zip_code}`
                          : 'Property information unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="leaseTenantCell">
                    <b>
                      {tenancy.tenant_name ||
                        tenancy.tenant_email}
                    </b>

                    <span>{tenancy.tenant_email}</span>
                  </div>

                  <div className="leaseRentCell">
                    <b>
                      $
                      {Number(
                        tenancy.monthly_rent || 0
                      ).toLocaleString()}
                    </b>

                    <span>per month</span>
                  </div>

                  <div className="leaseDateCell">
                    <b>
                      {tenancy.start_date
                        ? new Date(
                            tenancy.start_date +
                              'T00:00:00'
                          ).toLocaleDateString()
                        : '—'}
                    </b>

                    <span>Lease begins</span>
                  </div>

                  <div className="leaseDateCell">
                    <b>
                      {tenancy.end_date
                        ? new Date(
                            tenancy.end_date +
                              'T00:00:00'
                          ).toLocaleDateString()
                        : 'Open'}
                    </b>

                    <span>
                      {tenancy.end_date
                        ? 'Lease expires'
                        : 'No end date'}
                    </span>
                  </div>

                  <div className="leaseStatusCell">
                    <span
                      className={
                        tenancy.status === 'active'
                          ? 'leaseStatus active'
                          : 'leaseStatus'
                      }
                    >
                      <i></i>

                      {tenancy.status === 'active'
                        ? 'Active'
                        : tenancy.status || 'Inactive'}
                    </span>
                  </div>

                  <div className="leaseActionsCell">
                    <button
                      type="button"
                      className="tenantEditButton"
                      onClick={() => {
                        setEditingTenancy(tenancy);
                        setView('editTenant');
                      }}
                    >
                      Edit
                    </button>

                    {property && (
                      <button
                        type="button"
                        className="tenantPropertyButton"
                        onClick={() => {
                          setSelectedProperty(property);
                          loadTenancy(property.id);
                          setView('propertyDetails');
                        }}
                      >
                        Property
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  </section>
)}
         {view === 'applications' && (
          <section className="applicationsPage">

            <div className="applicationsHeader">
              <div>
                <small>APPLICANT MANAGEMENT</small>
                <h1>Applications</h1>
                <p>
                  Manage rental applications, applicant information,
                  and tenant screening from one place.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => setView('newApplication')}
              >
                + New Application
              </button>
            </div>

            <div className="applicationStats">

              <article>
                <span>Total Applications</span>
                <b>{applications.length}</b>
                <small>ALL APPLICATIONS</small>
              </article>

              <article>
                <span>New</span>
                <b>
                  {
                    applications.filter(
                      a => a.application_status === 'new'
                    ).length
                  }
                </b>
                <small>NEEDS REVIEW</small>
              </article>

              <article>
                <span>Screening</span>
                <b>
                  {
                    applications.filter(
                      a =>
                        a.screening_status === 'requested' ||
                        a.screening_status === 'in_progress'
                    ).length
                  }
                </b>
                <small>SCREENING</small>
              </article>

              <article>
                <span>Approved</span>
                <b>
                  {
                    applications.filter(
                      a => a.application_status === 'approved'
                    ).length
                  }
                </b>
                <small>APPROVED</small>
              </article>

            </div>

            <section className="applicationsDirectory">

              <div className="applicationsDirectoryHeader">
                <div>
                  <h2>Rental Applications</h2>
                  <p>
                    Review applicants and manage their screening process.
                  </p>
                </div>

                <span>
                  {applications.length}{' '}
                  {applications.length === 1
                    ? 'application'
                    : 'applications'}
                </span>
              </div>

              {applications.length === 0 ? (

                <div className="applicationsEmpty">

                  <div className="applicationsEmptyIcon">
                    ▣
                  </div>

                  <h3>No applications yet</h3>

                  <p>
                    Create an application for a prospective tenant
                    or send them an application link.
                  </p>

                  <button
                    type="button"
                    className="primary"
                    onClick={() => setView('newApplication')}
                  >
                    + Create Application
                  </button>

                </div>

              ) : (

                <div className="applicationsTable">

                  <div className="applicationsTableHeader">
                    <span>Applicant</span>
                    <span>Property</span>
                    <span>Income</span>
                    <span>Application</span>
                    <span>Screening</span>
                    <span>Action</span>
                  </div>

                  {applications.map(application => {

                    const property = props.find(
                      p => p.id === application.property_id
                    );

                    return (
                      <div
                        className="applicationRow"
                        key={application.id}
                      >

                        <div className="applicationApplicant">
                          <div className="applicationAvatar">
                            {(
                              application.applicant_name || 'A'
                            )
                              .split(' ')
                              .map(part =>
                                part.charAt(0)
                              )
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <b>
                              {application.applicant_name}
                            </b>

                            <span>
                              {application.applicant_email}
                            </span>

                            <small>
                              {application.applicant_phone ||
                                'No phone provided'}
                            </small>
                          </div>
                        </div>

                        <div className="applicationProperty">
                          <b>
                            {property?.address ||
                              'No property selected'}
                          </b>

                          <span>
                            {property
                              ? `${property.city}, ${property.state}`
                              : ''}
                          </span>
                        </div>

                        <div className="applicationIncome">
                          <b>
                            {application.monthly_income
                              ? '$' +
                                Number(
                                  application.monthly_income
                                ).toLocaleString()
                              : '—'}
                          </b>

                          <span>
                            Monthly income
                          </span>
                        </div>

                        <div>
                          <span
                            className={
                              'applicationStatus ' +
                              application.application_status
                            }
                          >
                            {application.application_status
                              .replaceAll('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <span
                            className={
                              'screeningStatus ' +
                              application.screening_status
                            }
                          >
                            {application.screening_status
                              .replaceAll('_', ' ')}
                          </span>
                        </div>

                        <div className="applicationActions">

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplication(
                                application
                              );
                              setView(
                                'applicationDetails'
                              );
                            }}
                          >
                            Review
                          </button>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </section>

          </section>
        )}

        {view === 'newApplication' && (
          <section className="applicationFormPage">

            <button
              type="button"
              className="applicationBackButton"
              onClick={() =>
                setView('applications')
              }
            >
              ← Back to Applications
            </button>

            <div className="applicationsHeader">
              <div>
                <small>NEW APPLICANT</small>
                <h1>Rental Application</h1>
                <p>
                  Enter applicant information to begin the
                  rental screening process.
                </p>
              </div>
            </div>

            <form
              className="applicationForm"
              onSubmit={async e => {

                e.preventDefault();

                const form = e.currentTarget;
                const s = supabase();

                const {
                  data: { user },
                  error: userError
                } = await s.auth.getUser();

                if (userError || !user) {
                  alert(
                    'Authentication error: ' +
                    (userError?.message ||
                      'No user found')
                  );
                  return;
                }

                const { error } = await s
                  .from('rental_applications')
                  .insert({
                    landlord_id: user.id,

                    property_id:
                      form.propertyId.value || null,

                    applicant_name:
                      form.applicantName.value.trim(),

                    applicant_email:
                      form.applicantEmail.value.trim(),

                    applicant_phone:
                      form.applicantPhone.value.trim(),

                    current_address:
                      form.currentAddress.value.trim(),

                    current_city:
                      form.currentCity.value.trim(),

                    current_state:
                      form.currentState.value.trim(),

                    current_zip:
                      form.currentZip.value.trim(),

                    employer_name:
                      form.employerName.value.trim(),

                    job_title:
                      form.jobTitle.value.trim(),

                    monthly_income:
                      Number(form.monthlyIncome.value) || null,

                    current_landlord_name:
                      form.currentLandlordName.value.trim(),

                    current_landlord_phone:
                      form.currentLandlordPhone.value.trim(),

                    current_rent:
                      Number(form.currentRent.value) || null,

                    previous_address:
                      form.previousAddress.value.trim(),

                    occupants_count:
                      Number(form.occupantsCount.value) || 1,

                    occupants_details:
                      form.occupantsDetails.value.trim(),

                    has_pets:
                      form.hasPets.value === 'yes',

                    pets_details:
                      form.petsDetails.value.trim(),

                    vehicles_details:
                      form.vehiclesDetails.value.trim(),

                    application_status: 'new',

                    screening_status: 'not_started'
                  });

                if (error) {
                  alert(
                    'Could not create application: ' +
                    error.message
                  );
                  return;
                }

                alert(
                  'Rental application created successfully!'
                );

                await load();

                setView('applications');
              }}
            >

              <section className="applicationFormSection">

                <div className="applicationFormSectionHeader">
                  <h2>Applicant Information</h2>
                  <p>
                    Basic contact information for the applicant.
                  </p>
                </div>

                <div className="applicationFormGrid">

                  <label>
                    Full Name
                    <input
                      name="applicantName"
                      required
                      placeholder="Applicant full name"
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      name="applicantEmail"
                      type="email"
                      required
                      placeholder="applicant@email.com"
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      name="applicantPhone"
                      type="tel"
                      placeholder="(502) 555-1234"
                    />
                  </label>

                  <label>
                    Property
                    <select
                      name="propertyId"
                      defaultValue=""
                    >
                      <option value="">
                        Select property
                      </option>

                      {props.map(property => (
                        <option
                          key={property.id}
                          value={property.id}
                        >
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </label>

                </div>

              </section>

              <section className="applicationFormSection">

                <div className="applicationFormSectionHeader">
                  <h2>Current Housing</h2>
                  <p>
                    Information about the applicant's current residence.
                  </p>
                </div>

                <div className="applicationFormGrid">

                  <label className="full">
                    Current Address
                    <input
                      name="currentAddress"
                      placeholder="Street address"
                    />
                  </label>

                  <label>
                    City
                    <input
                      name="currentCity"
                      placeholder="City"
                    />
                  </label>

                  <label>
                    State
                    <input
                      name="currentState"
                      placeholder="KY"
                    />
                  </label>

                  <label>
                    ZIP Code
                    <input
                      name="currentZip"
                      placeholder="40211"
                    />
                  </label>

                  <label>
                    Current Landlord
                    <input
                      name="currentLandlordName"
                      placeholder="Landlord name"
                    />
                  </label>

                  <label>
                    Landlord Phone
                    <input
                      name="currentLandlordPhone"
                      type="tel"
                      placeholder="Phone number"
                    />
                  </label>

                  <label>
                    Current Rent
                    <input
                      name="currentRent"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monthly rent"
                    />
                  </label>

                </div>

              </section>

              <section className="applicationFormSection">

                <div className="applicationFormSectionHeader">
                  <h2>Employment & Income</h2>
                  <p>
                    Employment information used for application review.
                  </p>
                </div>

                <div className="applicationFormGrid">

                  <label>
                    Employer
                    <input
                      name="employerName"
                      placeholder="Company name"
                    />
                  </label>

                  <label>
                    Job Title
                    <input
                      name="jobTitle"
                      placeholder="Job title"
                    />
                  </label>

                  <label>
                    Monthly Income
                    <input
                      name="monthlyIncome"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Monthly income"
                    />
                  </label>

                </div>

              </section>

              <section className="applicationFormSection">

                <div className="applicationFormSectionHeader">
                  <h2>Rental History</h2>
                  <p>
                    Previous housing information.
                  </p>
                </div>

                <div className="applicationFormGrid">

                  <label className="full">
                    Previous Address
                    <input
                      name="previousAddress"
                      placeholder="Previous rental address"
                    />
                  </label>

                </div>

              </section>

              <section className="applicationFormSection">

                <div className="applicationFormSectionHeader">
                  <h2>Household</h2>
                  <p>
                    Tell us about everyone and everything coming with
                    the applicant.
                  </p>
                </div>

                <div className="applicationFormGrid">

                  <label>
                    Number of Occupants
                    <input
                      name="occupantsCount"
                      type="number"
                      min="1"
                      defaultValue="1"
                    />
                  </label>

                  <label>
                    Pets
                    <select
                      name="hasPets"
                      defaultValue="no"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label className="full">
                    Occupant Details
                    <textarea
                      name="occupantsDetails"
                      placeholder="Names and relationship of other occupants"
                    />
                  </label>

                  <label className="full">
                    Pet Details
                    <textarea
                      name="petsDetails"
                      placeholder="Type, number, size, etc."
                    />
                  </label>

                  <label className="full">
                    Vehicles
                    <textarea
                      name="vehiclesDetails"
                      placeholder="Vehicle make, model, and year"
                    />
                  </label>

                </div>

              </section>

              <section className="screeningNotice">

                <div>
                  <h2>Tenant Screening</h2>

                  <p>
                    After the application is submitted, you can
                    request tenant screening. Credit and background
                    information will be handled through the screening
                    provider rather than stored directly in Rentwise.
                  </p>
                </div>

                <span>
                  SCREENING NOT STARTED
                </span>

              </section>

              <div className="applicationFormActions">

                <button
                  type="button"
                  onClick={() =>
                    setView('applications')
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Create Application
                </button>

              </div>

            </form>

          </section>
        )}      
        {view === 'applicationDetails' && selectedApplication && (
          <section className="applicationDetailsPage">

            <button
              type="button"
              className="applicationBackButton"
              onClick={() => setView('applications')}
            >
              ← Back to Applications
            </button>

            <div className="applicationDetailsHeader">
              <div>
                <small>APPLICATION REVIEW</small>
                <h1>{selectedApplication.applicant_name}</h1>
                <p>
                  Review applicant information, screening status,
                  and application details.
                </p>
              </div>

              <div className="applicationDetailsHeaderActions">
                <button
                  type="button"
                  onClick={() => setView('applications')}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="applicationDetailsGrid">

              <section className="applicationDetailsMain">

                <div className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>APPLICANT</small>
                      <h2>Applicant Information</h2>
                    </div>

                    <span
                      className={
                        'applicationStatus ' +
                        selectedApplication.application_status
                      }
                    >
                      {selectedApplication.application_status
                        .replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="applicationDetailGrid">

                    <div>
                      <span>Full Name</span>
                      <b>{selectedApplication.applicant_name}</b>
                    </div>

                    <div>
                      <span>Email</span>
                      <b>{selectedApplication.applicant_email}</b>
                    </div>

                    <div>
                      <span>Phone</span>
                      <b>
                        {selectedApplication.applicant_phone ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>Current Address</span>
                      <b>
                        {selectedApplication.current_address ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>City / State / ZIP</span>
                      <b>
                        {[
                          selectedApplication.current_city,
                          selectedApplication.current_state,
                          selectedApplication.current_zip
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Not provided'}
                      </b>
                    </div>

                  </div>
                </div>

                <div className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>EMPLOYMENT</small>
                      <h2>Employment & Income</h2>
                    </div>
                  </div>

                  <div className="applicationDetailGrid">

                    <div>
                      <span>Employer</span>
                      <b>
                        {selectedApplication.employer_name ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>Job Title</span>
                      <b>
                        {selectedApplication.job_title ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>Monthly Income</span>
                      <b>
                        {selectedApplication.monthly_income
                          ? '$' +
                            Number(
                              selectedApplication.monthly_income
                            ).toLocaleString()
                          : 'Not provided'}
                      </b>
                    </div>

                  </div>
                </div>

                <div className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>RENTAL HISTORY</small>
                      <h2>Housing History</h2>
                    </div>
                  </div>

                  <div className="applicationDetailGrid">

                    <div>
                      <span>Current Landlord</span>
                      <b>
                        {selectedApplication.current_landlord_name ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>Landlord Phone</span>
                      <b>
                        {selectedApplication.current_landlord_phone ||
                          'Not provided'}
                      </b>
                    </div>

                    <div>
                      <span>Current Rent</span>
                      <b>
                        {selectedApplication.current_rent
                          ? '$' +
                            Number(
                              selectedApplication.current_rent
                            ).toLocaleString()
                          : 'Not provided'}
                      </b>
                    </div>

                    <div className="fullDetail">
                      <span>Previous Address</span>
                      <b>
                        {selectedApplication.previous_address ||
                          'Not provided'}
                      </b>
                    </div>

                  </div>
                </div>

                <div className="applicationDetailCard">
                  <div className="applicationDetailCardHeader">
                    <div>
                      <small>HOUSEHOLD</small>
                      <h2>Household Information</h2>
                    </div>
                  </div>

                  <div className="applicationDetailGrid">

                    <div>
                      <span>Occupants</span>
                      <b>
                        {selectedApplication.occupants_count || 1}
                      </b>
                    </div>

                    <div>
                      <span>Pets</span>
                      <b>
                        {selectedApplication.has_pets
                          ? 'Yes'
                          : 'No'}
                      </b>
                    </div>

                    <div className="fullDetail">
                      <span>Occupant Details</span>
                      <b>
                        {selectedApplication.occupants_details ||
                          'None provided'}
                      </b>
                    </div>

                    <div className="fullDetail">
                      <span>Pet Details</span>
                      <b>
                        {selectedApplication.pets_details ||
                          'None provided'}
                      </b>
                    </div>

                    <div className="fullDetail">
                      <span>Vehicles</span>
                      <b>
                        {selectedApplication.vehicles_details ||
                          'None provided'}
                      </b>
                    </div>

                  </div>
                </div>

              </section>

              <aside className="applicationDetailsSidebar">

                <section className="screeningCard">

                  <div className="screeningCardTop">
                    <div>
                      <small>SCREENING</small>
                      <h2>Tenant Screening</h2>
                    </div>

                    <span
                      className={
                        'screeningStatus ' +
                        selectedApplication.screening_status
                      }
                    >
                      {selectedApplication.screening_status
                        .replaceAll('_', ' ')}
                    </span>
                  </div>

                  <p>
                    Credit, background, eviction, and identity
                    screening can be requested through an approved
                    screening provider.
                  </p>

                  {!selectedApplication.screening_consent ? (
                    <div className="screeningConsentNotice">
                      <b>Applicant consent required</b>

                      <span>
                        Screening should only be requested after the
                        applicant has provided the required authorization.
                      </span>
                    </div>
                  ) : (
                    <div className="screeningConsentNotice complete">
                      <b>Screening consent received</b>

                      <span>
                        Applicant authorization has been recorded.
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="primary screeningButton"
                    disabled={
                      !selectedApplication.screening_consent
                    }
                    onClick={async () => {

                      const s = supabase();

                      const { error } = await s
                        .from('rental_applications')
                        .update({
                          screening_status: 'requested',
                          screening_requested_at:
                            new Date().toISOString(),
                          application_status: 'screening',
                          updated_at:
                            new Date().toISOString()
                        })
                        .eq(
                          'id',
                          selectedApplication.id
                        );

                      if (error) {
                        alert(
                          'Could not request screening: ' +
                          error.message
                        );
                        return;
                      }

                      const updatedApplication = {
                        ...selectedApplication,
                        screening_status: 'requested',
                        screening_requested_at:
                          new Date().toISOString(),
                        application_status: 'screening'
                      };

                      setSelectedApplication(
                        updatedApplication
                      );

                      setApplications(
                        applications.map(application =>
                          application.id ===
                          selectedApplication.id
                            ? updatedApplication
                            : application
                        )
                      );

                      alert(
                        'Screening request created. Connect your screening provider to complete the report.'
                      );
                    }}
                  >
                    Request Tenant Screening
                  </button>

                  <div className="screeningItems">

                    <div>
                      <span>Identity</span>
                      <b>Pending</b>
                    </div>

                    <div>
                      <span>Credit</span>
                      <b>Pending</b>
                    </div>

                    <div>
                      <span>Criminal Background</span>
                      <b>Pending</b>
                    </div>

                    <div>
                      <span>Eviction History</span>
                      <b>Pending</b>
                    </div>

                  </div>

                </section>

                <section className="applicationDecisionCard">

                  <small>APPLICATION DECISION</small>

                  <h2>Review Decision</h2>

                  <p>
                    Record your application decision after reviewing
                    the applicant information and screening results.
                  </p>

                  <div className="applicationDecisionActions">

                    <button
                      type="button"
                      onClick={async () => {

                        const s = supabase();

                        const { error } = await s
                          .from('rental_applications')
                          .update({
                            application_status: 'approved',
                            updated_at:
                              new Date().toISOString()
                          })
                          .eq(
                            'id',
                            selectedApplication.id
                          );

                        if (error) {
                          alert(
                            'Could not approve application: ' +
                            error.message
                          );
                          return;
                        }

                        const updatedApplication = {
                          ...selectedApplication,
                          application_status: 'approved'
                        };

                        setSelectedApplication(
                          updatedApplication
                        );

                        setApplications(
                          applications.map(application =>
                            application.id ===
                            selectedApplication.id
                              ? updatedApplication
                              : application
                          )
                        );

                        alert('Application approved.');
                      }}
                    >
                      Approve Application
                    </button>

                    <button
                      type="button"
                      className="dangerButton"
                      onClick={async () => {

                        const s = supabase();

                        const { error } = await s
                          .from('rental_applications')
                          .update({
                            application_status: 'denied',
                            updated_at:
                              new Date().toISOString()
                          })
                          .eq(
                            'id',
                            selectedApplication.id
                          );

                        if (error) {
                          alert(
                            'Could not update application: ' +
                            error.message
                          );
                          return;
                        }

                        const updatedApplication = {
                          ...selectedApplication,
                          application_status: 'denied'
                        };

                        setSelectedApplication(
                          updatedApplication
                        );

                        setApplications(
                          applications.map(application =>
                            application.id ===
                            selectedApplication.id
                              ? updatedApplication
                              : application
                          )
                        );

                        alert('Application marked as denied.');
                      }}
                    >
                      Deny Application
                    </button>

                  </div>

                </section>

                <section className="applicationTimelineCard">

                  <small>APPLICATION TIMELINE</small>

                  <div className="timelineItem">
                    <div className="timelineDot" />
                    <div>
                      <b>Application created</b>
                      <span>
                        {new Date(
                          selectedApplication.created_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="timelineItem">
                    <div className="timelineDot" />
                    <div>
                      <b>Screening</b>
                      <span>
                        {selectedApplication.screening_status
                          .replaceAll('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="timelineItem">
                    <div className="timelineDot" />
                    <div>
                      <b>Application status</b>
                      <span>
                        {selectedApplication.application_status
                          .replaceAll('_', ' ')}
                      </span>
                    </div>
                  </div>

                </section>

              </aside>

            </div>

          </section>
        )}
{view === 'maintenance' && (
          <section className="panel">
            <h1>Maintenance</h1>
            <p>Maintenance management is coming next.</p>
          </section>
        )}
      </main>
    </div>
  );
}
