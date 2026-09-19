/* UNITVERO HOMEPAGE — COMPLETE REPLACEMENT
   Replace the ENTIRE contents of app/page.js with this file.

   Required public image files:
   /public/unitvero-hero-house.png
   /public/unitvero-landlord-phone.png
   /public/unitvero-tenant-phone.png

   This page intentionally uses one clean style block.
   It does not depend on the old homepage CSS.
*/

"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: "▣",
    title: "Rent Collection",
    text: "Get paid on time, every time."
  },
  {
    icon: "⚒",
    title: "Maintenance",
    text: "Submit & track requests easily."
  },
  {
    icon: "⌕",
    title: "Tenant Screening",
    text: "Find reliable tenants."
  },
  {
    icon: "▤",
    title: "Lease Management",
    text: "Create, sign, and store leases."
  },
  {
    icon: "▥",
    title: "Financial Reports",
    text: "Track income, expenses, and profit."
  },
  {
    icon: "▱",
    title: "Secure Messaging",
    text: "Stay connected in one place."
  }
];

const landlordItems = [
  "Track rent & expenses",
  "Manage properties",
  "Screen tenants",
  "Handle maintenance",
  "Generate reports",
  "Create custom landlord documents",
  "Send letters, leases & notices",
  "Send alerts to all tenants"
];

const tenantItems = [
  "Pay rent online",
  "Submit maintenance requests",
  "Access documents",
  "Receive notifications",
  "Communicate with your landlord",
  "Stay organized"
];

const testimonials = [
  {
    name: "Landon R.",
    role: "Property Owner",
    text: "Unitvero has made managing my properties so much easier. Everything I need is in one place."
  },
  {
    name: "Tyesha M.",
    role: "Tenant",
    text: "I love how easy it is to pay rent and submit maintenance requests! Great app!"
  },
  {
    name: "Marcus T.",
    role: "Real Estate Investor",
    text: "Clean, modern, and powerful. Exactly what I needed to manage my portfolio."
  }
];

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="unitveroHome">
      <nav className="siteNav">
        <Link href="/" className="logo" aria-label="Unitvero home">
          <span className="logoMark">⌂</span>
          <span>Unitvero</span>
        </Link>

        <div className="navLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
        </div>

        <div className="navButtons">
          <Link href="/login" className="loginButton">
            Log In
          </Link>
          <Link href="/signup" className="getStartedButton">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="heroImage" aria-hidden="true" />

        <div className="heroOverlay" />

        <div className="heroContent">
          <div className="heroCopy">
            <div className="pill">PROPERTY MANAGEMENT MADE SIMPLE</div>

            <h1>
              Smarter
              <br />
              Property
              <br />
              <span>Management</span>
              <br />
              Starts Here.
            </h1>

            <p>
              Everything landlords and tenants need in one modern platform.
              Manage properties, collect rent, handle maintenance, track
              finances, and stay connected — all in one place.
            </p>

            <div className="heroActions">
              <Link href="/signup" className="goldButton">
                Get Started <span>→</span>
              </Link>

              <button
                type="button"
                className="demoButton"
                onClick={() => setShowDemo(true)}
              >
                <span className="playCircle">▶</span>
                Watch Demo
              </button>
            </div>

            <div className="heroFinePrint">
              <span>1 Month of Pro Free</span>
              <b>•</b>
              <span>No Credit Card Required</span>
            </div>
          </div>

          <div className="heroCards" aria-label="Unitvero platform preview">
            <div className="metricCard revenueCard">
              <span className="cardLabel">Monthly Revenue</span>
              <strong>$48,750</strong>
              <small>↑ 12% from last month</small>
              <div className="miniBars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="metricCard occupancyCard">
              <span className="cardLabel">Occupancy Rate</span>
              <strong>92%</strong>
              <small>↑ 4% from last month</small>
              <div className="donut">
                <span>92%</span>
              </div>
            </div>

            <div className="propertyCard">
              <img
                src="/unitvero-hero-house.png"
                alt=""
              />
              <div>
                <span>Property Managed</span>
                <strong>1234 Maple St.</strong>
                <b>Unit 2A</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featureStrip" id="features">
        {features.map((feature) => (
          <article className="featureItem" key={feature.title}>
            <div className="featureIcon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="audienceGrid">
        <article className="audienceCard landlordCard">
          <div className="audienceCopy">
            <span className="sectionEyebrow">FOR LANDLORDS</span>
            <h2>
              More Control.
              <br />
              Less Work.
            </h2>

            <ul>
              {landlordItems.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="goldButton">
              Get Started as a Landlord <span>→</span>
            </Link>
          </div>

          <div className="phoneWrap landlordPhone">
            <img
              src="/unitvero-landlord-phone.png"
              alt="Unitvero landlord app"
            />
          </div>
        </article>

        <article className="audienceCard tenantCard">
          <div className="audienceCopy">
            <span className="sectionEyebrow">FOR TENANTS</span>
            <h2>
              A Better Renting
              <br />
              Experience.
            </h2>

            <ul>
              {tenantItems.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="goldButton">
              Get Started as a Tenant <span>→</span>
            </Link>
          </div>

          <div className="phoneWrap tenantPhone">
            <img
              src="/unitvero-tenant-phone.png"
              alt="Unitvero tenant app"
            />
          </div>
        </article>
      </section>

      <section className="proBanner" id="pricing">
        <div className="crown">♛</div>

        <div className="proText">
          <span>UNITVERO PRO</span>
          <h2>Try Unitvero Pro Free for 1 Month</h2>
          <p>
            Unlock advanced features and take your property management to the
            next level.
          </p>
        </div>

        <div className="proBenefits">
          <span>▥ Advanced Reports</span>
          <span>◉ Priority Support</span>
          <span>♙ Unlimited Properties</span>
          <span>⌕ Custom Branding</span>
        </div>

        <Link href="/signup" className="proButton">
          Get 1 Month Free <span>→</span>
        </Link>
      </section>

      <section className="testimonials" id="resources">
        <div className="sectionTitle">
          <h2>
            Trusted by Landlords and Tenants
          </h2>
          <p>See what our users are saying about Unitvero.</p>
        </div>

        <div className="testimonialGrid">
          {testimonials.map((item) => (
            <article className="testimonialCard" key={item.name}>
              <div className="testimonialTop">
                <div className="avatar">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>

              <p>“{item.text}”</p>

              <div className="stars">★★★★★</div>
            </article>
          ))}
        </div>
      </section>

      <footer id="about">
        <div className="footerBrand">
          <Link href="/" className="logo">
            <span className="logoMark">⌂</span>
            <span>Unitvero</span>
          </Link>
          <p>Manage Today. Build Tomorrow.</p>
        </div>

        <div className="footerLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <a href="/login">Contact</a>
        </div>

        <div className="socials" aria-label="Social media">
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="Facebook">f</a>
        </div>

        <div className="storeButtons">
          <div className="storeButton">
            <span className="storeIcon">●</span>
            <small>Download on the</small>
            <strong>App Store</strong>
          </div>
          <div className="storeButton">
            <span className="storeIcon">▶</span>
            <small>GET IT ON</small>
            <strong>Google Play</strong>
          </div>
        </div>
      </footer>

      {showDemo && (
        <div className="demoOverlay" role="dialog" aria-modal="true">
          <div className="demoModal">
            <button
              type="button"
              className="closeDemo"
              onClick={() => setShowDemo(false)}
              aria-label="Close demo"
            >
              ×
            </button>

            <span className="sectionEyebrow">UNITVERO DEMO</span>
            <h2>See Unitvero in action.</h2>
            <p>
              See rent collection, properties, tenants, maintenance,
              documents, messaging, landlord tools and the tenant portal.
            </p>

            <div className="videoBox">
              <video controls playsInline preload="metadata">
                <source src="/unitvero-demo.mp4" type="video/mp4" />
              </video>

              <div className="videoFallback">
                <div className="largePlay">▶</div>
                <strong>Unitvero Feature Demo</strong>
                <span>
                  Add <b>unitvero-demo.mp4</b> to the public folder when the
                  finished walkthrough video is ready.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        :root {
          --uv-black: #050606;
          --uv-black-2: #090b0b;
          --uv-panel: #101212;
          --uv-panel-2: #151716;
          --uv-gold: #f4c84f;
          --uv-gold-light: #ffd96b;
          --uv-gold-dark: #d9a92f;
          --uv-white: #f8f7f2;
          --uv-muted: #a7a8a2;
          --uv-line: rgba(244, 200, 79, 0.48);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--uv-black);
          color: var(--uv-white);
          font-family: Inter, Arial, sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .unitveroHome {
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(244, 200, 79, 0.035),
              transparent 30%
            ),
            #050606;
          color: var(--uv-white);
          font-family: Inter, Arial, sans-serif;
        }

        .unitveroHome *,
        .unitveroHome *::before,
        .unitveroHome *::after {
          font-family: Inter, Arial, sans-serif;
        }

        /* NAVIGATION */

        .siteNav {
          position: relative;
          z-index: 10;
          width: min(100% - 60px, 1450px);
          min-height: 84px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -0.055em;
          white-space: nowrap;
        }

        .logoMark {
          width: 34px;
          height: 34px;
          display: inline-grid;
          place-items: center;
          border: 2px solid var(--uv-gold);
          border-radius: 9px;
          color: var(--uv-gold);
          font-size: 20px;
          line-height: 1;
          box-shadow: inset 0 0 12px rgba(244, 200, 79, 0.08);
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 48px;
          margin-left: auto;
          margin-right: 40px;
        }

        .navLinks a {
          color: #eeeeea;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .navLinks a:hover {
          color: var(--uv-gold);
        }

        .navButtons {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .loginButton,
        .getStartedButton {
          min-height: 48px;
          padding: 0 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
        }

        .loginButton {
          border: 1px solid rgba(244, 200, 79, 0.7);
          background: rgba(4, 5, 5, 0.65);
          color: #fff;
        }

        .getStartedButton {
          min-width: 165px;
          background: linear-gradient(
            135deg,
            var(--uv-gold-light),
            var(--uv-gold)
          );
          color: #111;
          border: 1px solid var(--uv-gold-light);
          box-shadow: 0 12px 30px rgba(244, 200, 79, 0.14);
        }

        /* HERO */

        .hero {
          position: relative;
          width: min(100% - 60px, 1450px);
          min-height: 600px;
          margin: 0 auto;
          border-radius: 0 0 16px 16px;
          overflow: hidden;
          isolation: isolate;
        }

        .heroImage {
          position: absolute;
          inset: 0;
          z-index: -3;
          background-image: url("/unitvero-hero-house.png");
          background-size: cover;
          background-position: center center;
          transform: scale(1.01);
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.94) 0%,
              rgba(0, 0, 0, 0.84) 25%,
              rgba(0, 0, 0, 0.36) 58%,
              rgba(0, 0, 0, 0.2) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.12),
              rgba(0, 0, 0, 0.38)
            );
        }

        .heroContent {
          min-height: 600px;
          padding: 45px 20px 48px 45px;
          display: grid;
          grid-template-columns: minmax(440px, 0.88fr) minmax(540px, 1.12fr);
          align-items: center;
          gap: 40px;
        }

        .heroCopy {
          position: relative;
          z-index: 2;
          max-width: 620px;
        }

        .pill {
          width: fit-content;
          padding: 7px 16px;
          border: 1px solid var(--uv-gold);
          border-radius: 999px;
          color: var(--uv-gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .hero h1 {
          margin: 16px 0 20px;
          color: #fff;
          font-size: clamp(54px, 5.2vw, 86px);
          line-height: 0.92;
          letter-spacing: -0.07em;
          font-weight: 900;
        }

        .hero h1 span {
          color: var(--uv-gold);
        }

        .heroCopy > p {
          max-width: 590px;
          margin: 0;
          color: #f1f0eb;
          font-size: 16px;
          line-height: 1.58;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.55);
        }

        .heroActions {
          margin-top: 26px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .goldButton {
          min-height: 49px;
          padding: 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border: 1px solid var(--uv-gold-light);
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            #ffe078 0%,
            var(--uv-gold) 58%,
            #e6b43b 100%
          );
          color: #111;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 12px 26px rgba(244, 200, 79, 0.13);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .goldButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(244, 200, 79, 0.2);
        }

        .goldButton span {
          font-size: 21px;
          line-height: 1;
        }

        .demoButton {
          min-height: 49px;
          padding: 0 21px;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          border: 1px solid var(--uv-gold);
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.42);
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          backdrop-filter: blur(8px);
        }

        .playCircle {
          width: 28px;
          height: 28px;
          display: inline-grid;
          place-items: center;
          border-radius: 50%;
          background: var(--uv-gold);
          color: #111;
          font-size: 11px;
        }

        .heroFinePrint {
          margin-top: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #eee;
          font-size: 11px;
          font-weight: 600;
        }

        .heroFinePrint b {
          color: var(--uv-gold);
        }

        .heroCards {
          position: relative;
          min-height: 510px;
          align-self: stretch;
        }

        .metricCard {
          position: absolute;
          z-index: 3;
          padding: 20px;
          border: 1px solid rgba(244, 200, 79, 0.75);
          border-radius: 15px;
          background: rgba(12, 13, 12, 0.82);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.36);
          backdrop-filter: blur(9px);
        }

        .revenueCard {
          top: 70px;
          left: 0;
          width: 275px;
          min-height: 125px;
        }

        .occupancyCard {
          top: 160px;
          right: 0;
          width: 300px;
          min-height: 135px;
        }

        .cardLabel {
          display: block;
          color: #f0eee7;
          font-size: 12px;
          font-weight: 500;
        }

        .metricCard strong {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 30px;
          letter-spacing: -0.04em;
        }

        .metricCard small {
          display: block;
          margin-top: 7px;
          color: #c7ff75;
          font-size: 11px;
          font-weight: 800;
        }

        .miniBars {
          position: absolute;
          right: 18px;
          bottom: 19px;
          height: 60px;
          display: flex;
          align-items: end;
          gap: 5px;
        }

        .miniBars i {
          width: 9px;
          display: block;
          border-radius: 2px 2px 0 0;
          background: linear-gradient(
            180deg,
            #ffe17d,
            var(--uv-gold-dark)
          );
        }

        .miniBars i:nth-child(1) { height: 20px; }
        .miniBars i:nth-child(2) { height: 28px; }
        .miniBars i:nth-child(3) { height: 38px; }
        .miniBars i:nth-child(4) { height: 30px; }
        .miniBars i:nth-child(5) { height: 49px; }
        .miniBars i:nth-child(6) { height: 60px; }

        .donut {
          position: absolute;
          right: 18px;
          top: 24px;
          width: 75px;
          height: 75px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              #101212 53%,
              transparent 54%
            ),
            conic-gradient(
              var(--uv-gold) 0 92%,
              rgba(255,255,255,0.22) 92% 100%
            );
        }

        .donut span {
          color: #fff;
          font-size: 13px;
          font-weight: 900;
        }

        .propertyCard {
          position: absolute;
          z-index: 4;
          right: 80px;
          bottom: 30px;
          width: 365px;
          min-height: 105px;
          padding: 11px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid rgba(244, 200, 79, 0.8);
          border-radius: 14px;
          background: rgba(9, 10, 9, 0.86);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }

        .propertyCard img {
          width: 92px;
          height: 82px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.25);
        }

        .propertyCard div {
          display: grid;
          gap: 4px;
        }

        .propertyCard span {
          color: #dddcd6;
          font-size: 11px;
        }

        .propertyCard strong {
          color: #fff;
          font-size: 17px;
        }

        .propertyCard b {
          color: #fff;
          font-size: 15px;
          font-weight: 500;
        }

        /* FEATURE STRIP */

        .featureStrip {
          width: min(100% - 60px, 1450px);
          margin: 0 auto;
          padding: 17px 25px 16px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          border: 1px solid var(--uv-gold);
          border-radius: 0 0 14px 14px;
          background:
            linear-gradient(
              180deg,
              rgba(16, 17, 16, 0.96),
              rgba(8, 9, 9, 0.98)
            );
        }

        .featureItem {
          min-height: 125px;
          padding: 0 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-right: 1px solid rgba(244, 200, 79, 0.1);
        }

        .featureItem:last-child {
          border-right: 0;
        }

        .featureIcon {
          width: 54px;
          height: 54px;
          margin-bottom: 10px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(244, 200, 79, 0.35);
          border-radius: 10px;
          background: linear-gradient(
            145deg,
            #171918,
            #0d0f0f
          );
          color: var(--uv-gold);
          font-size: 27px;
          font-weight: 700;
          box-shadow: inset 0 0 15px rgba(244, 200, 79, 0.03);
        }

        .featureItem h3 {
          margin: 0;
          color: #fff;
          font-size: 15px;
          letter-spacing: -0.02em;
        }

        .featureItem p {
          max-width: 160px;
          margin: 6px 0 0;
          color: #b1b2ad;
          font-size: 11px;
          line-height: 1.45;
        }

        /* LANDLORD + TENANT */

        .audienceGrid {
          width: min(100% - 60px, 1450px);
          margin: 16px auto 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .audienceCard {
          position: relative;
          min-height: 405px;
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          border: 1px solid var(--uv-gold);
          border-radius: 14px;
          background:
            radial-gradient(
              circle at 70% 50%,
              rgba(244, 200, 79, 0.055),
              transparent 35%
            ),
            linear-gradient(145deg, #0b0d0d, #131514);
        }

        .audienceCopy {
          position: relative;
          z-index: 3;
          padding: 24px 20px 22px 24px;
        }

        .sectionEyebrow {
          color: var(--uv-gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .audienceCopy h2 {
          margin: 8px 0 15px;
          color: #fff;
          font-size: clamp(29px, 3vw, 43px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .audienceCopy ul {
          margin: 0 0 20px;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 7px;
        }

        .audienceCopy li {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #f1f0eb;
          font-size: 12px;
          line-height: 1.25;
        }

        .audienceCopy li span {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--uv-gold);
          color: #111;
          font-size: 11px;
          font-weight: 900;
        }

        .audienceCopy .goldButton {
          margin-top: 2px;
          min-height: 43px;
          padding: 0 15px;
          font-size: 11px;
        }

        .phoneWrap {
          position: relative;
          min-height: 405px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
        }

        .phoneWrap::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 120px;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
          background: rgba(244, 200, 79, 0.13);
          filter: blur(25px);
        }

        .phoneWrap img {
          position: relative;
          z-index: 2;
          display: block;
          width: 245px;
          max-width: none;
          height: auto;
          filter: drop-shadow(0 22px 28px rgba(0,0,0,0.55));
        }

        .landlordPhone img {
          transform: rotate(5deg) translateY(12px);
        }

        .tenantPhone img {
          transform: rotate(-5deg) translateY(12px);
        }

        /* PRO */

        .proBanner {
          width: min(100% - 60px, 1450px);
          margin: 16px auto 0;
          min-height: 118px;
          padding: 18px 25px;
          display: grid;
          grid-template-columns: 75px minmax(280px, 1fr) minmax(330px, auto) auto;
          align-items: center;
          gap: 20px;
          border: 1px solid var(--uv-gold);
          border-radius: 14px;
          background:
            radial-gradient(
              circle at 8% 50%,
              rgba(244, 200, 79, 0.12),
              transparent 25%
            ),
            linear-gradient(145deg, #151306, #0b0d0d);
        }

        .crown {
          color: var(--uv-gold);
          font-size: 54px;
          line-height: 1;
          text-align: center;
        }

        .proText > span {
          color: var(--uv-gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .proText h2 {
          margin: 4px 0 4px;
          color: #fff;
          font-size: 23px;
          letter-spacing: -0.04em;
        }

        .proText p {
          margin: 0;
          color: #aaa9a2;
          font-size: 10px;
        }

        .proBenefits {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        .proBenefits span {
          color: #c9c8c0;
          font-size: 10px;
          white-space: nowrap;
        }

        .proButton {
          min-height: 45px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-radius: 9px;
          background: linear-gradient(
            135deg,
            #ffe078,
            var(--uv-gold)
          );
          border: 1px solid #ffe58e;
          color: #111;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        /* TESTIMONIALS */

        .testimonials {
          width: min(100% - 60px, 1450px);
          margin: 26px auto 0;
          padding-bottom: 22px;
        }

        .sectionTitle h2 {
          margin: 0;
          color: #fff;
          font-size: 26px;
          letter-spacing: -0.04em;
        }

        .sectionTitle p {
          margin: 4px 0 13px;
          color: #9b9c96;
          font-size: 11px;
        }

        .testimonialGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .testimonialCard {
          min-height: 170px;
          padding: 18px;
          border: 1px solid rgba(244, 200, 79, 0.22);
          border-radius: 12px;
          background: linear-gradient(145deg, #101212, #0a0c0c);
        }

        .testimonialTop {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(145deg, #eee6cf, #92866b);
          color: #201e19;
          font-size: 17px;
          font-weight: 900;
        }

        .testimonialTop div:last-child {
          display: grid;
          gap: 2px;
        }

        .testimonialTop strong {
          color: #fff;
          font-size: 12px;
        }

        .testimonialTop span {
          color: #a7a8a2;
          font-size: 10px;
        }

        .testimonialCard p {
          margin: 15px 0 11px;
          color: #efeee9;
          font-size: 12px;
          line-height: 1.55;
        }

        .stars {
          color: var(--uv-gold);
          font-size: 15px;
          letter-spacing: 2px;
        }

        /* FOOTER */

        footer {
          width: min(100% - 60px, 1450px);
          min-height: 110px;
          margin: 0 auto;
          padding: 22px 0;
          display: grid;
          grid-template-columns: 1.15fr 1fr auto auto;
          align-items: center;
          gap: 30px;
          border-top: 1px solid rgba(244, 200, 79, 0.25);
        }

        .footerBrand .logo {
          font-size: 22px;
        }

        .footerBrand .logoMark {
          width: 30px;
          height: 30px;
          font-size: 17px;
        }

        .footerBrand p {
          margin: 5px 0 0;
          color: #a0a19b;
          font-size: 10px;
        }

        .footerLinks {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
        }

        .footerLinks a {
          color: #c5c5be;
          font-size: 10px;
        }

        .footerLinks a:hover {
          color: var(--uv-gold);
        }

        .socials {
          display: flex;
          align-items: center;
          gap: 17px;
        }

        .socials a {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 19px;
          font-weight: 900;
        }

        .socials a:hover {
          color: var(--uv-gold);
        }

        .storeButtons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .storeButton {
          position: relative;
          min-width: 125px;
          min-height: 43px;
          padding: 5px 9px 5px 30px;
          display: grid;
          align-content: center;
          border: 1px solid #999a95;
          border-radius: 8px;
          color: #fff;
        }

        .storeButton small {
          font-size: 7px;
          line-height: 1;
        }

        .storeButton strong {
          font-size: 14px;
          line-height: 1.1;
        }

        .storeIcon {
          position: absolute;
          left: 9px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
        }

        /* DEMO MODAL */

        .demoOverlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 22px;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(10px);
        }

        .demoModal {
          position: relative;
          width: min(1000px, 100%);
          max-height: 92vh;
          overflow: auto;
          padding: 30px;
          border: 1px solid rgba(244, 200, 79, 0.6);
          border-radius: 17px;
          background: #090b0b;
          box-shadow: 0 35px 100px rgba(0,0,0,0.75);
        }

        .closeDemo {
          position: absolute;
          top: 13px;
          right: 13px;
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(244, 200, 79, 0.35);
          border-radius: 50%;
          background: #111313;
          color: var(--uv-gold);
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }

        .demoModal h2 {
          margin: 6px 0;
          color: #fff;
          font-size: 32px;
          letter-spacing: -0.05em;
        }

        .demoModal > p {
          max-width: 760px;
          margin: 0 0 18px;
          color: #999b95;
          font-size: 12px;
          line-height: 1.6;
        }

        .videoBox {
          position: relative;
          min-height: 430px;
          overflow: hidden;
          border: 1px solid rgba(244, 200, 79, 0.25);
          border-radius: 12px;
          background: #020303;
        }

        .videoBox video {
          display: block;
          width: 100%;
          height: 430px;
          background: #020303;
        }

        .videoFallback {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: rgba(2,3,3,0.78);
          text-align: center;
          pointer-events: none;
        }

        .largePlay {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--uv-gold);
          color: #111;
          font-size: 21px;
        }

        .videoFallback strong {
          color: #fff;
          font-size: 17px;
        }

        .videoFallback span {
          color: #898b85;
          font-size: 10px;
        }

        .videoFallback b {
          color: var(--uv-gold);
        }

        /* RESPONSIVE */

        @media (max-width: 1180px) {
          .navLinks {
            gap: 25px;
            margin-right: 10px;
          }

          .heroContent {
            grid-template-columns: 1fr;
            padding: 50px;
          }

          .hero {
            min-height: auto;
          }

          .heroCards {
            min-height: 500px;
          }

          .heroCopy {
            max-width: 680px;
          }

          .audienceCard {
            grid-template-columns: minmax(0, 1fr) 220px;
          }

          .phoneWrap img {
            width: 220px;
          }

          .proBanner {
            grid-template-columns: 70px 1fr;
          }

          .proBenefits {
            justify-content: flex-start;
            grid-column: 2;
          }

          .proButton {
            grid-column: 2;
            width: fit-content;
          }

          footer {
            grid-template-columns: 1fr 1fr;
          }

          .footerLinks {
            justify-content: flex-start;
          }
        }

        @media (max-width: 900px) {
          .siteNav {
            width: min(100% - 30px, 1450px);
          }

          .navLinks {
            display: none;
          }

          .hero,
          .featureStrip,
          .audienceGrid,
          .proBanner,
          .testimonials,
          footer {
            width: min(100% - 30px, 1450px);
          }

          .featureStrip {
            grid-template-columns: repeat(3, 1fr);
          }

          .featureItem:nth-child(3) {
            border-right: 0;
          }

          .featureItem:nth-child(n + 4) {
            margin-top: 15px;
          }

          .audienceGrid {
            grid-template-columns: 1fr;
          }

          .testimonialGrid {
            grid-template-columns: 1fr;
          }

          .testimonialCard {
            min-height: auto;
          }
        }

        @media (max-width: 650px) {
          .siteNav {
            min-height: 70px;
          }

          .logo {
            font-size: 20px;
          }

          .logoMark {
            width: 29px;
            height: 29px;
            font-size: 17px;
          }

          .getStartedButton {
            min-width: 115px;
            padding: 0 14px;
          }

          .loginButton {
            display: none;
          }

          .heroContent {
            padding: 32px 20px 25px;
          }

          .hero h1 {
            font-size: 50px;
          }

          .heroCopy > p {
            font-size: 14px;
          }

          .heroCards {
            min-height: 390px;
          }

          .revenueCard {
            top: 0;
            left: 0;
            width: 205px;
          }

          .occupancyCard {
            top: 85px;
            right: 0;
            width: 220px;
          }

          .propertyCard {
            right: 10px;
            bottom: 10px;
            width: calc(100% - 20px);
          }

          .featureStrip {
            grid-template-columns: repeat(2, 1fr);
            padding: 12px;
          }

          .featureItem {
            min-height: 120px;
            padding: 10px 8px;
          }

          .featureItem:nth-child(odd) {
            border-right: 1px solid rgba(244, 200, 79, 0.1);
          }

          .featureItem:nth-child(even) {
            border-right: 0;
          }

          .audienceCard {
            grid-template-columns: 1fr;
          }

          .audienceCopy {
            padding: 22px 18px;
          }

          .audienceCopy h2 {
            font-size: 35px;
          }

          .audienceCopy ul {
            gap: 8px;
          }

          .phoneWrap {
            min-height: 310px;
          }

          .phoneWrap img {
            width: 215px;
          }

          .proBanner {
            grid-template-columns: 55px 1fr;
            padding: 17px;
          }

          .crown {
            font-size: 40px;
          }

          .proText h2 {
            font-size: 19px;
          }

          .proBenefits {
            grid-column: 1 / -1;
            gap: 10px;
          }

          .proButton {
            grid-column: 1 / -1;
            width: 100%;
          }

          footer {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .footerLinks {
            flex-wrap: wrap;
          }

          .socials {
            justify-content: flex-start;
          }

          .storeButtons {
            flex-wrap: wrap;
          }

          .demoOverlay {
            padding: 10px;
          }

          .demoModal {
            padding: 20px;
          }

          .videoBox,
          .videoBox video {
            min-height: 230px;
            height: 230px;
          }
        }
      `}</style>
    </main>
  );
}
