"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  ["$", "Rent Collection", "Get paid on time, every time."],
  ["⚒", "Maintenance", "Submit and track requests easily."],
  ["⌕", "Tenant Screening", "Find reliable tenants."],
  ["▤", "Lease Management", "Create, sign, and store leases."],
  ["▥", "Financial Reports", "Track income, expenses, and profit."],
  ["▱", "Secure Messaging", "Stay connected in one place."],
];

const landlordBenefits = ["Track rent and expenses", "Manage properties", "Screen tenants", "Handle maintenance", "Generate reports", "Use on web and mobile"];
const tenantBenefits = ["Pay rent online", "Submit maintenance requests", "Access documents", "Receive notifications", "Communicate with your landlord", "Stay organized"];

function Brand({ footer = false }) {
  return <Link href="/" className={`uvBrand ${footer ? "footer" : ""}`} aria-label="Unitvero home"><span className="uvBrandMark"><i/><i/></span><strong>Unitvero</strong></Link>;
}

function CheckList({ items }) {
  return <ul className="uvCheckList">{items.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>;
}

function Phone({ tenant = false }) {
  return (
    <div className={`uvPhone ${tenant ? "tenant" : "landlord"}`}>
      <div className="uvPhoneSpeaker"/>
      <div className="uvPhoneTop"><span className="uvMiniMark">⌂</span><b>Unitvero</b><i>☰</i></div>
      {tenant ? <>
        <small>Good morning, Tevis</small><h4>Your rental</h4>
        <div className="uvPhoneProperty"><span>⌂</span><div><b>Unit 2A</b><small>1234 Maple St.</small></div></div>
        {["Pay Rent", "Maintenance", "Documents", "Messages"].map((item) => <div className="uvPhoneRow" key={item}><span>◇</span><b>{item}</b><i>›</i></div>)}
      </> : <>
        <small>Good morning, Landon</small><h4>Portfolio overview</h4>
        <div className="uvPhoneStats"><div><small>Revenue</small><b>$48,750</b></div><div><small>Occupancy</small><b>92%</b></div></div>
        <div className="uvPhoneChart">{[36,52,45,70,62,86,75,96].map((v, i) => <i key={i} style={{height:`${v}%`}}/>)}</div>
        <div className="uvPhoneRows"><span>48 Properties</span><span>4 Open Requests</span></div>
      </>}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="uvLanding">
      <nav className="uvTopNav">
        <Brand/>
        <div className={`uvNavLinks ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#resources" onClick={() => setMenuOpen(false)}>Resources</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </div>
        <div className="uvNavActions"><Link href="/login" className="uvOutlineButton">Log In</Link><Link href="/signup" className="uvGoldButton">Get Started</Link></div>
        <button className="uvMenuButton" type="button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </nav>

      <section className="uvHero">
        <div className="uvHeroOverlay"/>
        <div className="uvHeroCopy">
          <span className="uvPill">Property Management Made Simple</span>
          <h1>Smarter Property<br/><em>Management</em><br/>Starts Here.</h1>
          <p>Everything landlords and tenants need in one modern platform. Manage properties, collect rent, handle maintenance, track finances, and stay connected—all in one place.</p>
          <div className="uvHeroActions"><Link href="/signup" className="uvGoldButton large">Get Started <span>→</span></Link><button type="button" className="uvDemoButton" onClick={() => setShowDemo(true)}><span>▶</span> Watch Demo</button></div>
          <small>1 Month of Pro Free&nbsp;&nbsp;•&nbsp;&nbsp;No Credit Card Required</small>
        </div>
        <div className="uvHeroMetrics">
          <article><small>Monthly Revenue</small><strong>$48,750</strong><span>↑ 12% from last month</span><div className="uvMicroBars">{[26,36,48,63,78,92].map((n,i)=><i key={i} style={{height:`${n}%`}}/>)}</div></article>
          <article><small>Occupancy Rate</small><strong>92%</strong><span>↑ 4% from last month</span><div className="uvRing"><i/></div></article>
          <article className="property"><div className="uvPropertyThumb"/><div><small>Property Managed</small><strong>1234 Maple St.</strong><span>Unit 2A</span></div></article>
        </div>
      </section>

      <section className="uvFeatureStrip" id="features">{features.map(([icon,title,text]) => <article key={title}><span>{icon}</span><b>{title}</b><small>{text}</small></article>)}</section>

      <section className="uvAudience" id="resources">
        <article><div className="uvAudienceCopy"><span>For Landlords</span><h2>More Control. Less Work.</h2><CheckList items={landlordBenefits}/><Link href="/signup" className="uvGoldButton">Get Started as a Landlord <b>→</b></Link></div><Phone/></article>
        <article><div className="uvAudienceCopy"><span>For Tenants</span><h2>A Better Renting Experience.</h2><CheckList items={tenantBenefits}/><Link href="/signup" className="uvGoldButton">Get Started as a Tenant <b>→</b></Link></div><Phone tenant/></article>
      </section>

      <section className="uvProBanner" id="pricing"><span className="uvCrown">♛</span><div><h2>Try Unitvero Pro Free for 1 Month</h2><p>Unlock advanced features and take your property management to the next level.</p><div><span>▣ Advanced Reports</span><span>◉ Priority Support</span><span>♙ Unlimited Properties</span><span>◇ Custom Branding</span></div></div><Link href="/signup" className="uvGoldButton">Get 1 Month Free <b>→</b></Link></section>

      <section className="uvTestimonials" id="about">
        <div><h2>Trusted by Landlords and Tenants</h2><p>See what our users are saying about Unitvero.</p></div>
        <div className="uvTestimonialGrid">{[["LA","Landon R.","Property Owner","Unitvero has made managing my properties so much easier. Everything I need is in one place."],["TM","Tyesha M.","Tenant","I love how easy it is to pay rent and submit maintenance requests. Great app!"],["MT","Marcus T.","Real Estate Investor","Clean, modern, and powerful. Exactly what I needed to manage my portfolio."]].map(([initials,name,role,quote]) => <article key={name}><header><span>{initials}</span><div><b>{name}</b><small>{role}</small></div></header><p>“{quote}”</p><strong>★★★★★</strong></article>)}</div>
      </section>

      <footer className="uvFooter"><Brand footer/><span>Manage Today. Build Tomorrow.</span><nav><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#resources">Resources</a><a href="#about">About</a><Link href="/login">Contact</Link></nav><small>© {new Date().getFullYear()} Unitvero</small></footer>

      {showDemo && <div className="uvModalBackdrop" role="dialog" aria-modal="true" aria-label="Unitvero demo"><div className="uvModal"><button type="button" onClick={() => setShowDemo(false)} aria-label="Close">×</button><span className="uvPill">UNITVERO DEMO</span><h2>One platform. Two better experiences.</h2><p>Landlords manage the full portfolio while tenants pay, message, submit requests, and access documents.</p><div className="uvDemoScreens"><Phone/><Phone tenant/></div><Link href="/signup" className="uvGoldButton large">Start Free <span>→</span></Link></div></div>}
    </main>
  );
}
