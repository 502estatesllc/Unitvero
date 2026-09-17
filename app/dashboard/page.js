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
    .single();

  if (error) {
    alert('Could not update property: ' + error.message);
    return;
  }

  setSelectedProperty(data);
  await load();
  alert('Property updated successfully!');
  setView('propertyDetails');
}
  async function out() {
    await supabase().auth.signOut();
    r.push('/login');
  }

  return (
    <div className="app">
      <aside>
        <b className="logo">
          rent<span>wise</span>
        </b>

        <a
          className={view === 'overview' ? 'active' : ''}
          onClick={() => setView('overview')}
        >
          Overview
        </a>

        <a
          className={view === 'properties' ? 'active' : ''}
          onClick={() => setView('properties')}
        >
          Properties
        </a>

        <a onClick={() => setView('tenants')}>Tenants</a>
        <a onClick={() => setView('rent')}>Rent</a>
        <a onClick={() => setView('leases')}>Leases</a>
        <a onClick={() => setView('maintenance')}>Maintenance</a>

        <button onClick={out}>Sign out</button>
      </aside>

      <main className="dash">
        {view === 'overview' && (
          <>
            <div className="top">
              <div>
                <small>{profile?.role || 'Rentwise'} PORTAL</small>
                <h1>
                  Good to see you
                  {profile?.full_name
                    ? ', ' + profile.full_name.split(' ')[0]
                    : ''}
                  .
                </h1>
              </div>
            </div>

            <div className="stats">
              <article>
                <span>Properties</span>
                <b>{props.length}</b>
              </article>

              <article>
                <span>Tenants</span>
                <b>0</b>
              </article>

              <article>
                <span>Rent collected</span>
                <b>$0</b>
              </article>
            </div>
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
          <section className="panel">
            <button
              type="button"
              onClick={() => setView('properties')}
            >
              ← Back to Properties
            </button>

            <small>PROPERTY</small>
            <h1>{selectedProperty.address}</h1>
             <button type="button" onClick={() => setView('editProperty')}>
  Edit Property
</button>   

            <p>
              {selectedProperty.city}, {selectedProperty.state}{' '}
              {selectedProperty.zip_code}
            </p>

            <div className="stats">
              <article>
                <span>Monthly Rent</span>
                <b>${selectedProperty.monthly_rent || 0}</b>
              </article>

              <article>
                <span>Tenants</span>
                <b>0</b>
              </article>

              <article>
                <span>Status</span>
                <b>Active</b>
              </article>
            </div>
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
    onClick={saveProperty}
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
