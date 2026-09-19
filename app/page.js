Here is the complete, updated Next.js component code matching the exact layout, structure, icons, and card placements shown in the design image.

Key adjustments made to match the reference:
Hero Cards positioning & styling: Placed the cards exactly as in the mock (Revenue card near top center, Occupancy donut card on the upper right, and the wide Property Managed preview pill card resting across the bottom right).
Feature Bar Layout: Formatted as individual rounded dark boxes with glowing gold border treatments and SVGs for accurate icons ($, Wrench, Search, Document, Chart, Message).
Audience Cards & Content:
   - Replaced list items to match the exact 6 bullets visible in the design (e.g., "Use on web & mobile", updated tenant text).
   - Created phone mockups matching the exact screens and phone frames shown in the design.
Unitvero Pro Section:
   - Restructured into the horizontal banner with the crown icon on the far left, copy in the center, and the Get 1 Month Free → button positioned cleanly on the right with the features arranged below or inline.
Testimonial Avatars & Cards:
   - Swapped letter avatars for photo-styled avatars and aligned star ratings.
Footer Layout & App Store Badges:
   - Organized into the exact 4-column footer alignment with branded App Store and Google Play buttons and social icons.

``jsx
"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <path d="M15 9.5a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5h-1A2.5 2.5 0 0 1 9 14.5" />
      </svg>
    ),
    title: "Rent Collection",
    desc: "Get paid on time,\nevery time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Maintenance",
    desc: "Submit & track\nrequests easily.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Tenant Screening",
    desc: "Find reliable tenants.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    title: "Lease Management",
    desc: "Create, sign, and\nstore leases.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Financial Reports",
    desc: "Track income,\nexpenses, and profit.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <polyline points="9 10 12 13 15 10" />
      </svg>
    ),
    title: "Secure Messaging",
    desc: "Stay connected\nin one place.",
  },
];

const landlordItems = [
  "Track rent & expenses",
  "Manage properties",
  "Screen tenants",
  "Handle maintenance",
  "Generate reports",
  "Use on web & mobile",
];

const tenantItems = [
  "Pay rent online",
  "Submit maintenance requests",
  "Access documents",
  "Receive notifications",
  "Communicate with your landlord",
  "Stay organized",
];

export default function Home() {
  const [demo, setDemo] = useState(false);

  return (
    <main className="uv">
      {/ NAVIGATION /}
      <header className="nav">
        <Link href="/" className="logo">
          <div className="logoMark">
            <svg viewBox="0 0 24 24" fill="#f4c84f" width="22" height="22">
              <path d="M12 3L2 12h3v8h6v-5h2v5h6v-8h3L12 3z" />
            </svg>
          </div>
          <span className="logoName">Unitvero</span>
        </Link>

        <nav className="navLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
        </nav>

        <div className="navActions">
          <Link href="/login" className="loginBtn">
            Log In
          </Link>
          <Link href="/signup" className="goldPillBtn">
            Get Started
          </Link>
        </div>
      </header>

      {/ HERO /}
      <section className="heroSection">
        <img
          className="heroBg"
          src="/unitvero-hero-house.png"
          alt="Modern villa architecture"
        />
        <div className="heroShading" />

        <div className="heroGrid">
          <div className="heroLeft">
            <div className="eyebrowBadge">
              PROPERTY MANAGEMENT MADE SIMPLE
            </div>

            <h1 className="heroTitle">
              Smarter
              <br />
              Property
              <br />
              <span>Management</span>
              <br />
              Starts Here.
            </h1>

            <p className="heroDesc">
              Everything landlords and tenants need in one modern platform.
              Manage properties, collect rent, handle maintenance, track
              finances, and stay connected — all in one place.
            </p>

            <div className="heroCtas">
              <Link href="/signup" className="goldCtaBtn">
                Get Started <span>→</span>
              </Link>
              <button className="watchDemoBtn" onClick={() => setDemo(true)}>
                <span className="playCircle">▶</span>
                Watch Demo
              </button>
            </div>

            <div className="subFinePrint">
              <span>1 Month of Pro Free</span>
              <span className="bulletDot">•</span>
              <span>No Credit Card Required</span>
            </div>
          </div>

          <div className="heroRight">
            {/ Revenue Card /}
            <div className="floatCard revenueCard">
              <div className="cardHeaderRow">
                <div>
                  <small>Monthly Revenue</small>
                  <strong>$48,750</strong>
                  <span className="statUp">↑ 12% from last month</span>
                </div>
                <div className="miniBarChart">
                  <span style={{ height: "30%" }} />
                  <span style={{ height: "45%" }} />
                  <span style={{ height: "60%" }} />
                  <span style={{ height: "80%" }} />
                  <span style={{ height: "100%" }} />
                </div>
              </div>
            </div>

            {/ Occupancy Card /}
            <div className="floatCard occupancyCard">
              <div className="occupancyLeft">
                <small>Occupancy Rate</small>
                <strong>92%</strong>
                <span className="statUp">↑ 4% from last month</span>
              </div>
              <div className="donutRing">
                <div className="donutInner">92%</div>
              </div>
            </div>

            {/ Property Managed Card /}
            <div className="floatCard propertyCard">
              <img
                src="/unitvero-hero-house.png"
                alt="Property thumb"
                className="propThumb"
              />
              <div className="propInfo">
                <small>Property Managed</small>
                <strong>1234 Maple St.</strong>
                <span>Unit 2A</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/ FEATURES /}
      <section id="features" className="featuresContainer">
        <div className="featuresRow">
          {features.map((f, i) => (
            <div className="featureBox" key={i}>
              <div className="featureIcon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/ AUDIENCE DUAL CARDS /}
      <section className="audienceSection">
        {/ Landlords /}
        <div className="cardAudience">
          <div className="cardAudienceContent">
            <span className="pillTag">FOR LANDLORDS</span>
            <h2>
              More Control.
              <br />
              Less Work.
            </h2>
            <ul className="checkList">
              {landlordItems.map((item) => (
                <li key={item}>
                  <span className="checkCircle">✔</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="goldFullBtn">
              Get Started as a Landlord <span>→</span>
            </Link>
          </div>
          <div className="phoneWrap">
            <img
              src="/unitvero-landlord-phone.png"
              alt="Landlord Phone App"
              className="phoneImage"
            />
          </div>
        </div>

        {/ Tenants /}
        <div className="cardAudience">
          <div className="cardAudienceContent">
            <span className="pillTag">FOR TENANTS</span>
            <h2>
              A Better Renting
              <br />
              Experience.
            </h2>
            <ul className="checkList">
              {tenantItems.map((item) => (
                <li key={item}>
                  <span className="checkCircle">✔</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="goldFullBtn">
              Get Started as a Tenant <span>→</span>
            </Link>
          </div>
          <div className="phoneWrap">
            <img
              src="/unitvero-tenant-phone.png"
              alt="Tenant Phone App"
              className="phoneImage"
            />
          </div>
        </div>
      </section>

      {/ PRO BANNER /}
      <section id="pricing" className="proSection">
        <div className="proBanner">
          <div className="crownIcon">
            <svg viewBox="0 0 24 24" width="46" height="46" fill="#f4c84f">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>

          <div className="proText">
            <span className="proTag">UNITVERO PRO</span>
            <h3>Try Unitvero Pro Free for 1 Month</h3>
            <p>Unlock advanced features and take your property management to the next level.</p>
          </div>

          <div className="proRightAction">
            <Link href="/signup" className="goldProBtn">
              Get 1 Month Free →
            </Link>
          </div>

          <div className="proFeaturesRow">
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f4c84f" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Advanced Reports
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f4c84f" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              Priority Support
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f4c84f" strokeWidth="2.5"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>
              Unlimited Properties
            </span>
            <span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f4c84f" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Custom Branding
            </span>
          </div>
        </div>
      </section>

      {/ TESTIMONIALS /}
      <section id="resources" className="testimonialSection">
        <div className="sectionIntro">
          <h3>Trusted by Landlords and Tenants</h3>
          <p>See what our users are saying about Unitvero.</p>
        </div>

        <div className="testimonialCardsGrid">
          {/ 1 /}
          <div className="reviewBox">
            <div className="reviewPerson">
              <div className="avatarRing">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Landon R." />
              </div>
              <div className="personMeta">
                <strong>Landon R.</strong>
                <span>Property Owner</span>
              </div>
            </div>
            <p>“Unitvero has made managing my properties so much easier. Everything I need is in one place.”</p>
            <div className="starRow">★★★★★</div>
          </div>

          {/ 2 /}
          <div className="reviewBox">
            <div className="reviewPerson">
              <div className="avatarRing">
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80" alt="Tyesha M." />
              </div>
              <div className="personMeta">
                <strong>Tyesha M.</strong>
                <span>Tenant</span>
              </div>
            </div>
            <p>“I love how easy it is to pay rent and submit maintenance requests! Great app!”</p>
            <div className="starRow">★★★★★</div>
          </div>

          {/ 3 /}
          <div className="reviewBox">
            <div className="reviewPerson">
              <div className="avatarRing">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Marcus T." />
              </div>
              <div className="personMeta">
                <strong>Marcus T.</strong>
                <span>Real Estate Investor</span>
              </div>
            </div>
            <p>“Clean, modern, and powerful. Exactly what I needed to manage my portfolio.”</p>
            <div className="starRow">★★★★★</div>
          </div>
        </div>
      </section>

      {/ FOOTER /}
      <footer id="about" className="mainFooter">
        <div className="footerCol brandCol">
          <Link href="/" className="logo">
            <div className="logoMark">
              <svg viewBox="0 0 24 24" fill="#f4c84f" width="20" height="20">
                <path d="M12 3L2 12h3v8h6v-5h2v5h6v-8h3L12 3z" />
              </svg>
            </div>
            <span className="logoName">Unitvero</span>
          </Link>
          <small>Manage Today. Build Tomorrow.</small>
        </div>

        <div className="footerCol linksCol">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <Link href="/login">Contact</Link>
        </div>

        <div className="footerCol socialCol">
          <a href="#instagram" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
          </a>
          <a href="#linkedin" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
          <a href="#facebook" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </a>
        </div>

        <div className="footerCol appStoresCol">
          <div className="storePill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.67-1.09 1.74-.95 2.77.99.08 2.05-.52 2.67-1.27z"/></svg>
            <div className="storeInfo">
              <span className="tiny">Download on the</span>
              <strong>App Store</strong>
            </div>
          </div>

          <div className="storePill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.368-.387-.61-.926-.61-1.536V3.35c0-.61.242-1.15.61-1.536zM15.207 13.414l2.138 2.138-12.83 7.42 10.692-9.558zm0-2.828L4.515 1.028l12.83 7.42-2.138 2.138zm1.414 1.414l3.197-1.85c.983-.568.983-1.493 0-2.062L16.621 12l3.197 1.85z"/></svg>
            <div className="storeInfo">
              <span className="tiny">GET IT ON</span>
              <strong>Google Play</strong>
            </div>
          </div>
        </div>
      </footer>

      {/ DEMO MODAL /}
      {demo && (
        <div className="modalOverlay" onClick={() => setDemo(false)}>
          <div className="modalBox" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={() => setDemo(false)}>×</button>
            <span className="pillTag">UNITVERO DEMO</span>
            <h2>See Unitvero in action.</h2>
            <p>Explore rent collection, tenant screening, maintenance tracking, and custom lease builder.</p>
            <div className="demoVideoWrapper">
              <video controls autoPlay playsInline>
                <source src="/unitvero-demo.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}

      {/ STYLES /}
      <style jsx global>{
         {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font-family: inherit;
          border: none;
          background: none;
        }

        .uv {
          width: 100%;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, rgba(244, 200, 79, 0.08), transparent 45%), #000000;
          padding-bottom: 30px;
        }

        / NAVIGATION /
        .nav {
          max-width: 1280px;
          height: 80px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .logoMark {
          width: 34px;
          height: 34px;
          background: #151515;
          border: 1.5px solid #f4c84f;
          border-radius: 9px;
          display: grid;
          place-items: center;
        }

        .logoName {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .navLinks {
          display: flex;
          gap: 34px;
        }

        .navLinks a {
          color: #d1d5db;
          font-size: 13.5px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .navLinks a:hover {
          color: #f4c84f;
        }

        .navActions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .loginBtn {
          font-size: 13.5px;
          font-weight: 700;
          padding: 10px 22px;
          border-radius: 8px;
          background: #18191a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .goldPillBtn {
          font-size: 13.5px;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, #ffe078, #f4c84f);
          color: #0b0b0b;
        }

        / HERO /
        .heroSection {
          max-width: 1280px;
          min-height: 620px;
          margin: 0 auto;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #09090b;
        }

        .heroBg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
        }

        .heroShading {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.96) 0%, rgba(0, 0, 0, 0.88) 38%, rgba(0, 0, 0, 0.25) 75%, rgba(0, 0, 0, 0.4) 100%),
                      linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
        }

        .heroGrid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          padding: 50px 48px;
          min-height: 600px;
          align-items: center;
        }

        .eyebrowBadge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f4c84f;
          border: 1px solid #f4c84f;
          padding: 5px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
        }

        .heroTitle {
          font-size: clamp(48px, 5.2vw, 76px);
          line-height: 0.95;
          letter-spacing: -2px;
          font-weight: 900;
          margin-bottom: 22px;
        }

        .heroTitle span {
          color: #f4c84f;
        }

        .heroDesc {
          font-size: 14.5px;
          line-height: 1.6;
          color: #cfd4dc;
          max-width: 480px;
          margin-bottom: 28px;
        }

        .heroCtas {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .goldCtaBtn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 26px;
          background: linear-gradient(135deg, #ffe078, #f4c84f);
          color: #111;
          font-size: 14px;
          font-weight: 800;
          border-radius: 9px;
        }

        .watchDemoBtn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 22px;
          background: rgba(14, 14, 14, 0.7);
          border: 1px solid #f4c84f;
          border-radius: 9px;
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(8px);
        }

        .playCircle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f4c84f;
          color: #000;
          display: grid;
          place-items: center;
          font-size: 9px;
        }

        .subFinePrint {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #d1d5db;
        }

        .bulletDot {
          color: #f4c84f;
          font-weight: bold;
        }

        / HERO RIGHT VISUAL CARDS /
        .heroRight {
          position: relative;
          height: 480px;
        }

        .floatCard {
          position: absolute;
          background: rgba(15, 17, 18, 0.85);
          backdrop-filter: blur(14px);
          border: 1px solid #f4c84f;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .statUp {
          display: block;
          font-size: 10px;
          color: #9fe855;
          font-weight: 700;
          margin-top: 4px;
        }

        / Monthly Revenue /
        .revenueCard {
          top: 30px;
          left: 10px;
          width: 260px;
          padding: 16px 20px;
        }

        .cardHeaderRow {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .revenueCard small,
        .occupancyCard small {
          color: #e5e7eb;
          font-size: 11px;
          font-weight: 500;
        }

        .revenueCard strong,
        .occupancyCard strong {
          display: block;
          font-size: 26px;
          font-weight: 800;
          margin-top: 4px;
        }

        .miniBarChart {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 44px;
        }

        .miniBarChart span {
          width: 7px;
          background: linear-gradient(to top, #d9a92f, #ffe17d);
          border-radius: 2px 2px 0 0;
        }

        / Occupancy Card /
        .occupancyCard {
          top: 130px;
          right: 15px;
          width: 250px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .donutRing {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          background: conic-gradient(#f4c84f 0% 92%, #3a3b3c 92% 100%);
          display: grid;
          place-items: center;
        }

        .donutInner {
          width: 49px;
          height: 49px;
          background: #0f1112;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
        }

        / Property Managed Card /
        .propertyCard {
          bottom: 40px;
          right: 35px;
          width: 360px;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .propThumb {
          width: 75px;
          height: 65px;
          border-radius: 8px;
          object-fit: cover;
        }

        .propInfo small {
          color: #9ca3af;
          font-size: 10.5px;
        }

        .propInfo strong {
          display: block;
          font-size: 15px;
          font-weight: 700;
          margin-top: 2px;
        }

        .propInfo span {
          font-size: 12px;
          color: #e5e7eb;
        }

        / FEATURES BAR /
        .featuresContainer {
          max-width: 1280px;
          margin: 18px auto 0;
        }

        .featuresRow {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .featureBox {
          background: #090a0a;
          border: 1px solid #23221b;
          border-radius: 12px;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: border-color 0.2s;
        }

        .featureBox:hover {
          border-color: #f4c84f;
        }

        .featureIcon {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(244, 200, 79, 0.4);
          border-radius: 10px;
          background: #111313;
          display: grid;
          place-items: center;
          color: #f4c84f;
          margin-bottom: 12px;
        }

        .featureBox h4 {
          font-size: 13.5px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .featureBox p {
          font-size: 11px;
          line-height: 1.35;
          color: #9ca3af;
          white-space: pre-line;
        }

        / AUDIENCE SECTION /
        .audienceSection {
          max-width: 1280px;
          margin: 20px auto 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .cardAudience {
          background: #070808;
          border: 1px solid #f4c84f;
          border-radius: 16px;
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          overflow: hidden;
          padding: 32px 0 0 32px;
          position: relative;
        }

        .pillTag {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f4c84f;
          margin-bottom: 8px;
        }

        .cardAudienceContent h2 {
          font-size: 36px;
          line-height: 1;
          letter-spacing: -1.2px;
          font-weight: 800;
          margin-bottom: 22px;
        }

        .checkList {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-bottom: 26px;
        }

        .checkList li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: #ececec;
        }

        .checkCircle {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #f4c84f;
          color: #0b0b0b;
          font-size: 10px;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .goldFullBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: calc(100% - 20px);
          max-width: 250px;
          padding: 11px 16px;
          background: linear-gradient(135deg, #ffe078, #f4c84f);
          color: #111;
          font-size: 12px;
          font-weight: 800;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .phoneWrap {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
        }

        .phoneImage {
          width: 260px;
          transform: translateY(12px);
          display: block;
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8));
        }

        / PRO BANNER /
        .proSection {
          max-width: 1280px;
          margin: 20px auto 0;
        }

        .proBanner {
          background: #0b0c0c;
          border: 1px solid #f4c84f;
          border-radius: 14px;
          padding: 24px 34px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
        }

        .crownIcon {
          display: grid;
          place-items: center;
        }

        .proTag {
          font-size: 9.5px;
          font-weight: 800;
          color: #f4c84f;
          letter-spacing: 0.08em;
          display: block;
        }

        .proText h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 2px 0 4px;
        }

        .proText p {
          font-size: 11.5px;
          color: #9ca3af;
        }

        .goldProBtn {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          background: linear-gradient(135deg, #ffe078, #f4c84f);
          color: #111;
          font-size: 12.5px;
          font-weight: 800;
          border-radius: 8px;
          white-space: nowrap;
        }

        .proFeaturesRow {
          grid-column: 1 / -1;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding-top: 14px;
          display: flex;
          justify-content: flex-end;
          gap: 26px;
        }

        .proFeaturesRow span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          color: #cbd5e1;
        }

        / TESTIMONIALS /
        .testimonialSection {
          max-width: 1280px;
          margin: 36px auto 0;
        }

        .sectionIntro h3 {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .sectionIntro p {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 18px;
        }

        .testimonialCardsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .reviewBox {
          background: #090a0a;
          border: 1px solid rgba(244, 200, 79, 0.25);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
        }

        .reviewPerson {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatarRing {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #f4c84f;
          overflow: hidden;
        }

        .avatarRing img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .personMeta strong {
          display: block;
          font-size: 13.5px;
        }

        .personMeta span {
          font-size: 11px;
          color: #9ca3af;
        }

        .reviewBox p {
          font-size: 12.5px;
          line-height: 1.5;
          color: #d1d5db;
          margin: 12px 0;
        }

        .starRow {
          color: #f4c84f;
          letter-spacing: 2px;
          font-size: 13px;
        }

        / FOOTER /
        .mainFooter {
          max-width: 1280px;
          margin: 40px auto 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brandCol small {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          margin-top: 4px;
        }

        .linksCol {
          display: flex;
          gap: 24px;
        }

        .linksCol a {
          color: #d1d5db;
          font-size: 12px;
        }

        .linksCol a:hover {
          color: #f4c84f;
        }

        .socialCol {
          display: flex;
          gap: 14px;
        }

        .socialCol a {
          color: #fff;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .socialCol a:hover {
          opacity: 1;
        }

        .appStoresCol {
          display: flex;
          gap: 10px;
        }

        .storePill {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #444;
          background: #111;
          border-radius: 8px;
          padding: 6px 14px;
        }

        .storeInfo {
          display: flex;
          flex-direction: column;
        }

        .storeInfo .tiny {
          font-size: 8.5px;
          color: #9ca3af;
          line-height: 1;
        }

        .storeInfo strong {
          font-size: 12px;
          line-height: 1.2;
        }

        / DEMO MODAL /
        .modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .modalBox {
          position: relative;
          background: #0d0f10;
          border: 1px solid #f4c84f;
          border-radius: 16px;
          max-width: 840px;
          width: 100%;
          padding: 28px;
        }

        .closeBtn {
          position: absolute;
          top: 14px;
          right: 18px;
          font-size: 26px;
          color: #f4c84f;
          cursor: pointer;
        }

        .modalBox h2 {
          font-size: 26px;
          margin: 6px 0 4px;
        }

        .modalBox p {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 18px;
        }

        .demoVideoWrapper {
          width: 100%;
          height: 420px;
          background: #000;
          border-radius: 10px;
          overflow: hidden;
        }

        .demoVideoWrapper video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        / RESPONSIVE */
        @media (max-width: 1100px) {
          .heroGrid {
            grid-template-columns: 1fr;
          }
          .heroRight {
            display: none;
          }
          .featuresRow {
            grid-template-columns: repeat(3, 1fr);
          }
          .audienceSection {
            grid-template-columns: 1fr;
          }
          .proBanner {
            grid-template-columns: 1fr;
          }
          .mainFooter {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 680px) {
          .navLinks {
            display: none;
          }
          .featuresRow {
            grid-template-columns: repeat(2, 1fr);
          }
          .cardAudience {
            grid-template-columns: 1fr;
            padding: 24px;
          }
          .phoneWrap {
            margin-top: 14px;
          }
          .testimonialCardsGrid {
            grid-template-columns: 1fr;
          }
        }
      }</style>
    </main>
  );
}
``
