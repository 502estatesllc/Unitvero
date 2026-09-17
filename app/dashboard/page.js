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
  const [showApplicationForm, setShowApplicationForm] = useState(false);
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
            className={
              view === 'applications' ||
              view === 'newApplication' ||
              view === 'applicationDetails'
                ? 'active'
                : ''
            }
            onClick={() => setView('applications')}
          >
            <span className="navIcon">▣</span>
            <span>Applications</span>
          </a>

          <a
            className={view === 'documents' ? 'active' : ''}
            onClick={() => setView('documents')}
          >
            <span className="navIcon">▧</span>
            <span>Documents</span>
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

                  <div className="portfolioPreviewActions">
  <span className="portfolioPropertyCount">
    Showing {Math.min(props.length, 4)} of {props.length}
  </span>

  <button
    type="button"
    className="viewAllButton"
    onClick={() => setView('properties')}
  >
    View All Properties →
  </button>
</div>
                </div>

                <div className="dashboardProperties">
                  {props.length === 0 && (
                    <div className="noProperties">
                      <div className="propertyPlaceholderIcon">⌂</div>
                      <b>No properties yet</b>
                      <span>Add your first property to get started.</span>
                    </div>
                  )}

                  {props.slice(0, 4).map(p => (
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

            {props.length === 0 && (
              <p>No properties added yet.</p>
            )}

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
                <b>{selectedTenancy ? 'Occupied' : 'Vacant'}</b>
                <small>CURRENT STATUS</small>
              </article>

              <article>
                <span>Tenant</span>
                <b>
                  {selectedTenancy
                    ? selectedTenancy.tenant_name || 'Active'
                    : 'None'}
                </b>
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

            <p>
              Update the rental information for this property.
            </p>

            <div className="add">
              <input
                id="editRent"
                type="number"
                min="0"
                step="0.01"
                defaultValue={
                  selectedProperty.monthly_rent || 0
                }
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
              Add a tenant to {selectedProperty.address} and
              create their invitation.
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
                      (userError?.message ||
                        'No user found')
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
                const endDate =
                  form.endDate.value || null;

                if (endDate && endDate < startDate) {
                  alert(
                    'Lease end date cannot be before the lease start date.'
                  );
                  return;
                }

                const { error: tenancyError } =
                  await s.from('tenancies').insert({
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

                const { error: invitationError } =
                  await s.from('invitations').insert({
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

                  await loadTenancy(
                    selectedProperty.id
                  );

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

                await loadTenancy(
                  selectedProperty.id
                );

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
                  onClick={() =>
                    setView('propertyDetails')
                  }
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
          <section className="panel">
            <div className="dashboardHeader">
              <div>
                <small>TENANT MANAGEMENT</small>
                <h1>Tenants</h1>
                <p className="dashboardSubtitle">
                  Manage active tenants across your rental portfolio.
                </p>
              </div>
            </div>

            <div className="activityList">
              {tenancies.length === 0 && (
                <div className="featureEmpty">
                  <div className="featureEmptyIcon">♙</div>
                  <b>No tenants yet</b>
                  <span>
                    Add a tenant from one of your property pages.
                  </span>
                </div>
              )}

              {tenancies.map(tenancy => {
                const property = props.find(
                  p => p.id === tenancy.property_id
                );

                return (
                  <div className="activityRow" key={tenancy.id}>
                    <div className="activityTypeIcon">♙</div>

                    <div>
                      <b>
                        {tenancy.tenant_name ||
                          tenancy.tenant_email ||
                          'Tenant'}
                      </b>

                      <span>
                        {property?.address || 'Property'}
                      </span>

                      <span>{tenancy.tenant_email}</span>

                      <span>
                        $
                        {Number(
                          tenancy.monthly_rent || 0
                        ).toLocaleString()}{' '}
                        / month
                      </span>
                    </div>

                    <div>
                      <small>
                        {tenancy.status || 'active'}
                      </small>

                      <button
                        type="button"
                        className="viewAllButton"
                        onClick={() => {
                          setEditingTenancy(tenancy);
                          setView('editTenant');
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
              Update tenant and lease information.
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
                      editingTenancy.monthly_rent || 0
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
                  Save Tenant
                </button>
              </div>
            </form>
          </section>
        )}

        {view === 'leases' && (
          <section className="panel">
            <div className="dashboardHeader">
              <div>
                <small>LEASE MANAGEMENT</small>
                <h1>Leases</h1>
                <p className="dashboardSubtitle">
                  Review active rental agreements and lease dates.
                </p>
              </div>
            </div>

            <div className="activityList">
              {tenancies.length === 0 && (
                <div className="featureEmpty">
                  <div className="featureEmptyIcon">▤</div>
                  <b>No active leases</b>
                  <span>
                    Lease information will appear after a tenant is
                    added.
                  </span>
                </div>
              )}

              {tenancies.map(tenancy => {
                const property = props.find(
                  p => p.id === tenancy.property_id
                );

                return (
                  <div
                    className="activityRow"
                    key={tenancy.id}
                  >
                    <div className="activityTypeIcon">▤</div>

                    <div>
                      <b>
                        {tenancy.tenant_name ||
                          tenancy.tenant_email}
                      </b>

                      <span>
                        {property?.address || 'Property'}
                      </span>

                      <span>
                        {tenancy.start_date
                          ? new Date(
                              tenancy.start_date +
                                'T00:00:00'
                            ).toLocaleDateString()
                          : 'No start date'}
                        {' – '}
                        {tenancy.end_date
                          ? new Date(
                              tenancy.end_date +
                                'T00:00:00'
                            ).toLocaleDateString()
                          : 'Open ended'}
                      </span>

                      <span>
                        $
                        {Number(
                          tenancy.monthly_rent || 0
                        ).toLocaleString()}{' '}
                        / month
                      </span>
                    </div>

                    <div>
                      <small>
                        {tenancy.status || 'active'}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view === 'applications' && (
          <section className="applicationsPage">
            <div className="dashboardHeader applicationsHeader">
              <div>
                <small>LEASING PIPELINE</small>
                <h1>Applications</h1>

                <p className="dashboardSubtitle">
                  Review applicants, request tenant screening and
                  make leasing decisions.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() => {
                  setShowApplicationForm(true);
                  setView('newApplication');
                }}
              >
                + New Application
              </button>
            </div>

            <div className="applicationStats">
              <article>
                <div className="applicationStatIcon">▣</div>

                <div>
                  <span>Total Applications</span>
                  <b>{applications.length}</b>
                  <small>ALL APPLICANTS</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon new">+</div>

                <div>
                  <span>New</span>
                  <b>
                    {
                      applications.filter(
                        application =>
                          application.application_status === 'new'
                      ).length
                    }
                  </b>
                  <small>NEEDS REVIEW</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon screening">
                  ◉
                </div>

                <div>
                  <span>Screening</span>
                  <b>
                    {
                      applications.filter(
                        application =>
                          application.application_status ===
                          'screening'
                      ).length
                    }
                  </b>
                  <small>IN PROGRESS</small>
                </div>
              </article>

              <article>
                <div className="applicationStatIcon approved">
                  ✓
                </div>

                <div>
                  <span>Approved</span>
                  <b>
                    {
                      applications.filter(
                        application =>
                          application.application_status ===
                          'approved'
                      ).length
                    }
                  </b>
                  <small>READY FOR LEASE</small>
                </div>
              </article>
            </div>

            <section className="applicationDirectory">
              <div className="applicationDirectoryHeader">
                <div>
                  <h2>Rental Applications</h2>
                  <p>
                    Review applicant information and screening
                    progress.
                  </p>
                </div>

                <span className="applicationCount">
                  {applications.length}{' '}
                  {applications.length === 1
                    ? 'application'
                    : 'applications'}
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="applicationEmpty">
                  <div className="applicationEmptyIcon">▣</div>

                  <h3>No applications yet</h3>

                  <p>
                    Create an application to begin reviewing future
                    tenants.
                  </p>

                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setShowApplicationForm(true);
                      setView('newApplication');
                    }}
                  >
                    + Create Application
                  </button>
                </div>
              ) : (
                <div className="applicationTable">
                  <div className="applicationTableHeader">
                    <span>Applicant</span>
                    <span>Property</span>
                    <span>Screening</span>
                    <span>Status</span>
                    <span>Submitted</span>
                    <span></span>
                  </div>

                  {applications.map(application => {
                    const property = props.find(
                      p => p.id === application.property_id
                    );

                    const status =
                      application.application_status || 'new';

                    const screeningStatus =
                      application.screening_status ||
                      'not_started';

                    return (
                      <div
                        className="applicationTableRow"
                        key={application.id}
                      >
                        <div className="applicationPerson">
                          <div className="applicationAvatar">
                            {application.applicant_name
                              ?.charAt(0)
                              .toUpperCase() || 'A'}
                          </div>

                          <div>
                            <b>
                              {application.applicant_name}
                            </b>

                            <span>
                              {application.applicant_email}
                            </span>
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
                              : '—'}
                          </span>
                        </div>

                        <span
                          className={`applicationStatusBadge screening-${screeningStatus}`}
                        >
                          {screeningStatus
                            .replaceAll('_', ' ')}
                        </span>

                        <span
                          className={`applicationStatusBadge status-${status}`}
                        >
                          {status.replaceAll('_', ' ')}
                        </span>

                        <span className="applicationSubmitted">
                          {application.created_at
                            ? new Date(
                                application.created_at
                              ).toLocaleDateString()
                            : '—'}
                        </span>

                        <button
                          type="button"
                          className="applicationReviewButton"
                          onClick={() => {
                            setSelectedApplication(application);
                            setView('applicationDetails');
                          }}
                        >
                          Review →
                        </button>
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
              className="propertyBackButton"
              onClick={() => {
                setShowApplicationForm(false);
                setView('applications');
              }}
            >
              ← Back to Applications
            </button>

            <div className="applicationFormHeader">
              <small>NEW RENTAL APPLICATION</small>
              <h1>Create Application</h1>

              <p>
                Enter the applicant&apos;s rental information. Tenant
                screening can be requested after the application is
                created.
              </p>
            </div>

            <form
              className="rentalApplicationForm"
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

                const petValue =
                  form.hasPets.value === 'yes';

                const applicationRecord = {
                  landlord_id: user.id,
                  property_id:
                    form.propertyId.value || null,

                  applicant_name:
                    form.applicantName.value.trim(),

                  applicant_email:
                    form.applicantEmail.value.trim(),

                  applicant_phone:
                    form.applicantPhone.value.trim() ||
                    null,

                  current_address:
                    form.currentAddress.value.trim() ||
                    null,

                  current_city:
                    form.currentCity.value.trim() ||
                    null,

                  current_state:
                    form.currentState.value.trim() ||
                    null,

                  current_zip:
                    form.currentZip.value.trim() ||
                    null,

                  employer_name:
                    form.employerName.value.trim() ||
                    null,

                  job_title:
                    form.jobTitle.value.trim() ||
                    null,

                  monthly_income:
                    form.monthlyIncome.value
                      ? Number(form.monthlyIncome.value)
                      : null,

                  current_landlord_name:
                    form.currentLandlordName.value.trim() ||
                    null,

                  current_landlord_phone:
                    form.currentLandlordPhone.value.trim() ||
                    null,

                  current_rent:
                    form.currentRent.value
                      ? Number(form.currentRent.value)
                      : null,

                  previous_address:
                    form.previousAddress.value.trim() ||
                    null,

                  occupants_count:
                    Number(form.occupantsCount.value || 1),

                  occupants_details:
                    form.occupantsDetails.value.trim() ||
                    null,

                  has_pets: petValue,

                  pets_details: petValue
                    ? form.petsDetails.value.trim() || null
                    : null,

                  vehicles_details:
                    form.vehiclesDetails.value.trim() ||
                    null,

                  application_status: 'new',
                  screening_status: 'not_started'
                };

                const { data, error } = await s
                  .from('rental_applications')
                  .insert(applicationRecord)
                  .select()
                  .single();

                if (error) {
                  alert(
                    'Could not create application: ' +
                      error.message
                  );
                  return;
                }

                setApplications([
                  data,
                  ...applications
                ]);

                setSelectedApplication(data);
                setShowApplicationForm(false);

                alert(
                  'Rental application created successfully!'
                );

                setView('applicationDetails');
              }}
            >
              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>01</span>

                  <div>
                    <h2>Applicant Information</h2>
                    <p>
                      Basic contact and current address information.
                    </p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Full Name *
                    <input
                      name="applicantName"
                      type="text"
                      placeholder="Applicant full name"
                      required
                    />
                  </label>

                  <label>
                    Email Address *
                    <input
                      name="applicantEmail"
                      type="email"
                      placeholder="applicant@email.com"
                      required
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
                    Rental Property
                    <select name="propertyId">
                      <option value="">
                        Select property
                      </option>

                      {props.map(property => (
                        <option
                          value={property.id}
                          key={property.id}
                        >
                          {property.address}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="applicationWideField">
                    Current Street Address
                    <input
                      name="currentAddress"
                      type="text"
                      placeholder="Street address"
                    />
                  </label>

                  <label>
                    City
                    <input
                      name="currentCity"
                      type="text"
                      placeholder="City"
                    />
                  </label>

                  <label>
                    State
                    <input
                      name="currentState"
                      type="text"
                      placeholder="State"
                    />
                  </label>

                  <label>
                    ZIP Code
                    <input
                      name="currentZip"
                      type="text"
                      placeholder="ZIP"
                    />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>02</span>

                  <div>
                    <h2>Employment & Income</h2>
                    <p>
                      Employment details used during application
                      review.
                    </p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Employer
                    <input
                      name="employerName"
                      type="text"
                      placeholder="Employer name"
                    />
                  </label>

                  <label>
                    Job Title
                    <input
                      name="jobTitle"
                      type="text"
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
                      placeholder="0.00"
                    />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>03</span>

                  <div>
                    <h2>Rental History</h2>
                    <p>
                      Current landlord and previous housing
                      information.
                    </p>
                  </div>
                </div>

                <div className="applicationFormGrid">
                  <label>
                    Current Landlord
                    <input
                      name="currentLandlordName"
                      type="text"
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
                    Current Monthly Rent
                    <input
                      name="currentRent"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label className="applicationWideField">
                    Previous Address
                    <input
                      name="previousAddress"
                      type="text"
                      placeholder="Previous rental address"
                    />
                  </label>
                </div>
              </section>

              <section className="applicationFormCard">
                <div className="applicationFormSectionHeader">
                  <span>04</span>

                  <div>
                    <h2>Household</h2>
                    <p>
                      Occupants, pets and vehicle information.
                    </p>
                  </div>
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

                  <label className="applicationWideField">
                    Occupant Details
                    <textarea
                      name="occupantsDetails"
                      rows="3"
                      placeholder="Names and relationship of additional occupants"
                    />
                  </label>

                  <label className="applicationWideField">
                    Pet Details
                    <textarea
                      name="petsDetails"
                      rows="3"
                      placeholder="Type, breed, size, etc."
                    />
                  </label>

                  <label className="applicationWideField">
                    Vehicles
                    <textarea
                      name="vehiclesDetails"
                      rows="3"
                      placeholder="Vehicle make, model and year"
                    />
                  </label>
                </div>
              </section>

              <div className="screeningConsentNotice">
                <b>Tenant screening is handled separately</b>

                <span>
                  Do not enter Social Security numbers, credit card
                  information or consumer report data in this form.
                  Screening authorization will be handled by the
                  screening provider.
                </span>
              </div>

              <div className="applicationFormActions">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationForm(false);
                    setView('applications');
                  }}
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
        {view === 'applicationDetails' &&
          selectedApplication && (
            <section className="applicationDetailsPage">
              <button
                type="button"
                className="propertyBackButton"
                onClick={() => {
                  setSelectedApplication(null);
                  setView('applications');
                }}
              >
                ← Back to Applications
              </button>

              <div className="applicationDetailsHeader">
                <div className="applicationApplicantHeading">
                  <div className="applicationLargeAvatar">
                    {selectedApplication.applicant_name
                      ?.charAt(0)
                      .toUpperCase() || 'A'}
                  </div>

                  <div>
                    <small>APPLICATION REVIEW</small>

                    <h1>
                      {selectedApplication.applicant_name}
                    </h1>

                    <p>
                      {props.find(
                        p =>
                          p.id ===
                          selectedApplication.property_id
                      )?.address ||
                        'No property selected'}
                    </p>
                  </div>
                </div>

                <div className="applicationHeaderStatus">
                  <span
                    className={`applicationStatusBadge status-${
                      selectedApplication.application_status ||
                      'new'
                    }`}
                  >
                    {(
                      selectedApplication.application_status ||
                      'new'
                    ).replaceAll('_', ' ')}
                  </span>

                  <small>
                    Submitted{' '}
                    {selectedApplication.created_at
                      ? new Date(
                          selectedApplication.created_at
                        ).toLocaleDateString()
                      : '—'}
                  </small>
                </div>
              </div>

              <div className="applicationDetailsGrid">
                <div className="applicationDetailsMain">
                  <section className="applicationDetailCard">
                    <div className="applicationDetailCardHeader">
                      <div>
                        <small>CONTACT</small>
                        <h2>Applicant Information</h2>
                      </div>

                      <span>01</span>
                    </div>

                    <div className="applicationDetailFields">
                      <div>
                        <span>Full Name</span>
                        <b>
                          {selectedApplication.applicant_name ||
                            'Not provided'}
                        </b>
                      </div>

                      <div>
                        <span>Email Address</span>
                        <b>
                          {selectedApplication.applicant_email ||
                            'Not provided'}
                        </b>
                      </div>

                      <div>
                        <span>Phone Number</span>
                        <b>
                          {selectedApplication.applicant_phone ||
                            'Not provided'}
                        </b>
                      </div>

                      <div>
                        <span>Current Address</span>
                        <b>
                          {selectedApplication.current_address
                            ? `${selectedApplication.current_address}${
                                selectedApplication.current_city
                                  ? `, ${selectedApplication.current_city}`
                                  : ''
                              }${
                                selectedApplication.current_state
                                  ? `, ${selectedApplication.current_state}`
                                  : ''
                              }${
                                selectedApplication.current_zip
                                  ? ` ${selectedApplication.current_zip}`
                                  : ''
                              }`
                            : 'Not provided'}
                        </b>
                      </div>
                    </div>
                  </section>

                  <section className="applicationDetailCard">
                    <div className="applicationDetailCardHeader">
                      <div>
                        <small>FINANCIAL</small>
                        <h2>Employment & Income</h2>
                      </div>

                      <span>02</span>
                    </div>

                    <div className="applicationDetailFields">
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
                            ? `$${Number(
                                selectedApplication.monthly_income
                              ).toLocaleString()}`
                            : 'Not provided'}
                        </b>
                      </div>

                      <div>
                        <span>Current Rent</span>
                        <b>
                          {selectedApplication.current_rent
                            ? `$${Number(
                                selectedApplication.current_rent
                              ).toLocaleString()}`
                            : 'Not provided'}
                        </b>
                      </div>
                    </div>
                  </section>

                  <section className="applicationDetailCard">
                    <div className="applicationDetailCardHeader">
                      <div>
                        <small>HOUSING</small>
                        <h2>Rental History</h2>
                      </div>

                      <span>03</span>
                    </div>

                    <div className="applicationDetailFields">
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

                      <div className="applicationDetailWide">
                        <span>Previous Address</span>
                        <b>
                          {selectedApplication.previous_address ||
                            'Not provided'}
                        </b>
                      </div>
                    </div>
                  </section>

                  <section className="applicationDetailCard">
                    <div className="applicationDetailCardHeader">
                      <div>
                        <small>HOUSEHOLD</small>
                        <h2>Occupants & Property Details</h2>
                      </div>

                      <span>04</span>
                    </div>

                    <div className="applicationDetailFields">
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

                      <div className="applicationDetailWide">
                        <span>Occupant Details</span>
                        <b>
                          {selectedApplication.occupants_details ||
                            'Not provided'}
                        </b>
                      </div>

                      <div className="applicationDetailWide">
                        <span>Pet Details</span>
                        <b>
                          {selectedApplication.has_pets
                            ? selectedApplication.pets_details ||
                              'No details provided'
                            : 'No pets'}
                        </b>
                      </div>

                      <div className="applicationDetailWide">
                        <span>Vehicles</span>
                        <b>
                          {selectedApplication.vehicles_details ||
                            'Not provided'}
                        </b>
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="applicationDetailsSidebar">
                  <section className="screeningCenterCard">
                    <div className="screeningCenterHeader">
                      <div>
                        <small>TENANT SCREENING</small>
                        <h2>Screening Center</h2>
                      </div>

                      <span
                        className={`applicationStatusBadge screening-${
                          selectedApplication.screening_status ||
                          'not_started'
                        }`}
                      >
                        {(
                          selectedApplication.screening_status ||
                          'not_started'
                        ).replaceAll('_', ' ')}
                      </span>
                    </div>

                    <p className="screeningCenterDescription">
                      Request applicant screening through TransUnion
                      SmartMove.
                    </p>

                    <div className="screeningItems">
                      <div>
                        <span className="screeningItemIcon">✓</span>

                        <div>
                          <b>Identity Check</b>
                          <small>
                            {selectedApplication.screening_status ===
                            'completed'
                              ? 'Provider completed'
                              : 'Awaiting provider'}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span className="screeningItemIcon">$</span>

                        <div>
                          <b>Credit Report</b>
                          <small>
                            {selectedApplication.screening_status ===
                            'completed'
                              ? 'Provider completed'
                              : 'Awaiting provider'}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span className="screeningItemIcon">◇</span>

                        <div>
                          <b>Criminal Background</b>
                          <small>
                            {selectedApplication.screening_status ===
                            'completed'
                              ? 'Provider completed'
                              : 'Awaiting provider'}
                          </small>
                        </div>
                      </div>

                      <div>
                        <span className="screeningItemIcon">⌂</span>

                        <div>
                          <b>Eviction History</b>
                          <small>
                            {selectedApplication.screening_status ===
                            'completed'
                              ? 'Provider completed'
                              : 'Awaiting provider'}
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="screeningConsentNotice">
                      <b>Authorization handled by SmartMove</b>

                      <span>
                        SmartMove will email the applicant and collect
                        their authorization before releasing the
                        screening reports.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="primary screeningButton"
                      onClick={async () => {
                        const s = supabase();
                        const now = new Date().toISOString();

                        const { error } = await s
                          .from('rental_applications')
                          .update({
                            screening_status:
                              'pending_consent',
                            screening_requested_at: now,
                            application_status: 'screening',
                            updated_at: now
                          })
                          .eq(
                            'id',
                            selectedApplication.id
                          );

                        if (error) {
                          alert(
                            'Could not start screening: ' +
                              error.message
                          );
                          return;
                        }

                        const updatedApplication = {
                          ...selectedApplication,
                          screening_status:
                            'pending_consent',
                          screening_requested_at: now,
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

                        window.open(
                          'https://www.mysmartmove.com/landlord-tenant-screening',
                          '_blank',
                          'noopener,noreferrer'
                        );

                        alert(
                          'SmartMove opened in a new tab.\n\n' +
                            'Applicant: ' +
                            selectedApplication.applicant_name +
                            '\nEmail: ' +
                            selectedApplication.applicant_email +
                            '\n\nEnter this applicant email in SmartMove to send the screening request.'
                        );
                      }}
                    >
                      Start SmartMove Screening
                    </button>

                    {selectedApplication.screening_requested_at && (
                      <small className="screeningRequestedDate">
                        Screening started{' '}
                        {new Date(
                          selectedApplication.screening_requested_at
                        ).toLocaleString()}
                      </small>
                    )}
                  </section>

                  <section className="applicationDecisionCard">
                    <small>LEASING DECISION</small>
                    <h2>Application Decision</h2>

                    <p>
                      Update the application after completing your
                      review.
                    </p>

                    <div className="applicationDecisionActions">
                      <button
                        type="button"
                        className="approveApplicationButton"
                        onClick={async () => {
                          const s = supabase();
                          const now =
                            new Date().toISOString();

                          const { error } = await s
                            .from('rental_applications')
                            .update({
                              application_status:
                                'approved',
                              updated_at: now
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
                            application_status:
                              'approved',
                            updated_at: now
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
                            'Application approved successfully.'
                          );
                        }}
                      >
                        ✓ Approve
                      </button>

                      <button
                        type="button"
                        className="denyApplicationButton"
                        onClick={async () => {
                          const confirmed =
                            window.confirm(
                              'Mark this application as denied?'
                            );

                          if (!confirmed) return;

                          const s = supabase();
                          const now =
                            new Date().toISOString();

                          const { error } = await s
                            .from('rental_applications')
                            .update({
                              application_status:
                                'denied',
                              updated_at: now
                            })
                            .eq(
                              'id',
                              selectedApplication.id
                            );

                          if (error) {
                            alert(
                              'Could not deny application: ' +
                                error.message
                            );
                            return;
                          }

                          const updatedApplication = {
                            ...selectedApplication,
                            application_status: 'denied',
                            updated_at: now
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
                            'Application status updated to denied.'
                          );
                        }}
                      >
                        × Deny
                      </button>
                    </div>

                    <small className="applicationDecisionNote">
                      If a consumer report affects a leasing decision,
                      follow applicable adverse-action requirements.
                    </small>
                  </section>

                  <section className="applicationTimelineCard">
                    <small>ACTIVITY</small>
                    <h2>Application Timeline</h2>

                    <div className="applicationTimeline">
                      <div className="timelineItem complete">
                        <span></span>

                        <div>
                          <b>Application created</b>
                          <small>
                            {selectedApplication.created_at
                              ? new Date(
                                  selectedApplication.created_at
                                ).toLocaleString()
                              : 'Created'}
                          </small>
                        </div>
                      </div>

                      {selectedApplication.screening_requested_at && (
                        <div className="timelineItem active">
                          <span></span>

                          <div>
                            <b>
                              Screening pending consent
                            </b>

                            <small>
                              {new Date(
                                selectedApplication.screening_requested_at
                              ).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      )}

                      <div className="timelineItem active">
                        <span></span>

                        <div>
                          <b>Application status</b>

                          <small>
                            {(
                              selectedApplication.application_status ||
                              'new'
                            ).replaceAll('_', ' ')}
                          </small>
                        </div>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </section>
          )}

        {view === 'documents' && (
          <section className="documentsPage">
            <div className="applicationsHeader documentsHeader">
              <div>
                <small>DOCUMENT CENTER</small>
                <h1>Documents</h1>

                <p>
                  Create, send, track, and prepare rental documents
                  for eSignature.
                </p>
              </div>

              <button
                type="button"
                className="primary"
                onClick={() =>
                  alert(
                    'Custom document builder is the next Documents step.'
                  )
                }
              >
                + Create Document
              </button>
            </div>

            <div className="documentStats">
              <article>
                <span>Documents</span>
                <b>0</b>
                <small>ALL DOCUMENTS</small>
              </article>

              <article>
                <span>Awaiting Signature</span>
                <b>0</b>
                <small>ESIGN</small>
              </article>

              <article>
                <span>Completed</span>
                <b>0</b>
                <small>SIGNED & STORED</small>
              </article>

              <article>
                <span>Revenue</span>
                <b>$0</b>
                <small>DOCUMENT SERVICES</small>
              </article>
            </div>

            <section className="documentLibrary">
              <div className="documentLibraryHeader">
                <div>
                  <h2>Template Library</h2>

                  <p>
                    Start with a rental document and Rentwise will
                    eventually auto-fill tenant and property
                    information.
                  </p>
                </div>

                <span>Templates</span>
              </div>

              <div className="documentTemplateGrid">
                {[
                  [
                    '▤',
                    'Residential Lease',
                    'Create a new residential lease and prepare it for electronic signature.',
                    'LEASE'
                  ],
                  [
                    '↻',
                    'Lease Renewal',
                    'Prepare updated lease terms for an existing tenant.',
                    'LEASE'
                  ],
                  [
                    '!',
                    'Late Rent Notice',
                    'Create a written notice concerning an outstanding rent balance.',
                    'NOTICE'
                  ],
                  [
                    '⌂',
                    'Notice to Vacate',
                    'Prepare a state-specific notice to end or recover possession of a tenancy.',
                    'NOTICE'
                  ],
                  [
                    '$',
                    'Rent Change Notice',
                    'Document an upcoming rent change for a tenant.',
                    'NOTICE'
                  ],
                  [
                    '⌁',
                    'Notice of Entry',
                    'Create written notice of planned property access.',
                    'NOTICE'
                  ],
                  [
                    '+',
                    'Lease Addendum',
                    'Add property rules or additional terms to an existing lease.',
                    'ADDENDUM'
                  ],
                  [
                    '✓',
                    'Move-In / Move-Out',
                    'Create condition and turnover documentation.',
                    'PROPERTY'
                  ]
                ].map(
                  ([icon, title, description, type]) => (
                    <article
                      className="documentTemplateCard"
                      key={title}
                    >
                      <div className="documentTemplateIcon">
                        {icon}
                      </div>

                      <span className="documentType">
                        {type}
                      </span>

                      <h3>{title}</h3>

                      <p>{description}</p>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            title +
                              ' builder is being prepared.'
                          )
                        }
                      >
                        Create document →
                      </button>
                    </article>
                  )
                )}
              </div>
            </section>

            <section className="esignBanner">
              <div className="esignBannerIcon">✎</div>

              <div>
                <small>ESIGN FOUNDATION</small>

                <h2>
                  Electronic signatures inside Rentwise
                </h2>

                <p>
                  The document workflow is being structured for Draft
                  → Sent → Viewed → Signed → Completed. Provider
                  connection and real charges will be added before
                  launch.
                </p>
              </div>

              <span>COMING NEXT</span>
            </section>
          </section>
        )}

        {view === 'rent' && (
          <section className="panel">
            <small>RENT COLLECTION</small>
            <h1>Rent</h1>

            <p>
              Online rent collection and payment tracking is coming
              next.
            </p>

            <div className="featureEmpty">
              <div className="featureEmptyIcon">$</div>
              <b>Rent collection</b>

              <span>
                Payments, balances and transaction history will appear
                here.
              </span>
            </div>
          </section>
        )}

        {view === 'maintenance' && (
          <section className="panel">
            <small>PROPERTY OPERATIONS</small>
            <h1>Maintenance</h1>

            <p>
              Track maintenance requests across your rental
              portfolio.
            </p>

            <div className="featureEmpty">
              <div className="featureEmptyIcon">◇</div>
              <b>No maintenance requests</b>

              <span>
                New tenant maintenance requests will appear here.
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
