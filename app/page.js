"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  { icon: "⌁", title: "Rent Collection", text: "Get paid on time, every time. Track charges, payments, balances, autopay, and payout activity." },
  { icon: "⚒", title: "Maintenance", text: "Submit, track, photograph, and organize repair requests from one place." },
  { icon: "⌕", title: "Tenant Screening", text: "Keep applications and renter information organized as you move applicants through your leasing workflow." },
  { icon: "▤", title: "Lease Management", text: "Create, organize, share, and track leases and important rental documents." },
  { icon: "▣", title: "Financial Reports", text: "Track income, expenses, cash flow, bookkeeping records, and portfolio performance." },
  { icon: "▱", title: "Secure Messaging", text: "Stay connected with tenants through organized in-app conversations and announcements." },
  { icon: "◎", title: "Property Insights", text: "See property information, market-rent data, and portfolio-level insights in one dashboard." },
  { icon: "▦", title: "Tenant Portal", text: "Give renters a dedicated place to pay rent, request maintenance, view documents, and message you." },
];

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="homePage">
      <nav className="topNav">
        <Link className="brand" href="/" aria-label="Unitvero home">
          unit<span>vero</span>
        </Link>

        <div className="navLinks">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
        </div>

        <div className="navActions">
          <Link className="signIn" href="/login">
            Sign in
          </Link>
          <Link className="primaryButton small" href="/signup">
            Get started
          </Link>
        </div>
      </nav>

      <div className="launchOffer">
        <span className="launchOfferBadge">LIMITED LAUNCH OFFER</span>
        <strong>Get 1 month of Unitvero Pro FREE</strong>
        <span>Try the full Pro experience before your regular plan begins.</span>
        <Link href="/signup">Claim your free month →</Link>
      </div>

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">THE MODERN WAY TO MANAGE RENTALS</span>
          <h1>
            Everything for your rentals.
            <span> All in one place.</span>
          </h1>
          <p>
            Manage properties, collect rent, organize documents, track maintenance, communicate with tenants, and keep your rental business organized from one premium workspace.
          </p>

          <div className="heroActions">
            <Link className="primaryButton" href="/signup">
              Start free — 1 month of Pro <span>→</span>
            </Link>
            <a className="secondaryButton" href="#features">
              Explore features
            </a>
          </div>

          <div className="trustRow">
            <span>✓ 1 month of Pro free</span>
            <span>✓ Landlord + tenant portals</span>
            <span>✓ Built for phone + desktop</span>
          </div>
        </div>

        <div
          className="dashboardPreview"
          aria-label="Unitvero dashboard preview"
        >
          <div className="previewTop">
            <div>
              <span className="previewLogo">u</span>
              <b>Portfolio Overview</b>
            </div>
            <span className="previewAvatar">LA</span>
          </div>

          <div className="previewStats">
            <article>
              <span>Properties</span>
              <b>6</b>
              <small>8 rentable units</small>
            </article>
            <article>
              <span>Occupancy</span>
              <b>88%</b>
              <small>7 occupied</small>
            </article>
            <article>
              <span>Monthly rent</span>
              <b>$7,000</b>
              <small>Expected</small>
            </article>
          </div>

          <div className="previewGrid">
            <article className="collectionCard">
              <div className="previewCardTitle">
                <div>
                  <small>THIS MONTH</small>
                  <b>Rent collection</b>
                </div>
                <strong>82%</strong>
              </div>
              <div className="progressTrack">
                <span />
              </div>
              <div className="moneyRow">
                <span>Collected</span>
                <b>$5,740</b>
              </div>
              <div className="moneyRow">
                <span>Outstanding</span>
                <b>$1,260</b>
              </div>
            </article>

            <article className="activityCard">
              <small>RECENT ACTIVITY</small>
              <div>
                <i className="#f4c84f">✓</i>
                <span>
                  <b>Rent received</b>
                  <small>Today</small>
                </span>
              </div>
              <div>
                <i className="#f4c84f">✉</i>
                <span>
                  <b>New tenant message</b>
                  <small>2 hours ago</small>
                </span>
              </div>
              <div>
                <i className="#f4c84f">◇</i>
                <span>
                  <b>Maintenance updated</b>
                  <small>Yesterday</small>
                </span>
              </div>
            </article>
          </div>

          <div className="previewFooter">
            <span>Portfolio health</span>
            <div>
              <i />
              <b>Looking good</b>
            </div>
          </div>
        </div>
      </section>

      <section className="metricsStrip">
        <div>
          <b>One dashboard</b>
          <span>for your entire rental business</span>
        </div>
        <div>
          <b>Real-time visibility</b>
          <span>into rent and occupancy</span>
        </div>
        <div>
          <b>Less busywork</b>
          <span>and fewer scattered records</span>
        </div>
      </section>

      <section className="audienceSection">
        <div className="audienceCard">
          <span className="eyebrow">FOR LANDLORDS</span>
          <h2>Run your portfolio like a business.</h2>
          <p>Properties, tenants, rent, maintenance, documents, bookkeeping, communication and portfolio insights in one place.</p>
          <Link href="/signup" className="textButton">Create a landlord account →</Link>
        </div>
        <div className="audienceCard">
          <span className="eyebrow">FOR TENANTS</span>
          <h2>A better rental experience.</h2>
          <p>Pay rent, submit maintenance requests, view documents, receive announcements and message your landlord from one secure portal.</p>
          <Link href="/signup" className="textButton">Create a tenant account →</Link>
        </div>
      </section>

      <section className="featuresSection" id="features">
        <div className="sectionHeading">
          <span className="eyebrow">EVERYTHING IN ONE PLACE</span>
          <h2>Built to make landlording feel manageable</h2>
          <p>
            From your first property to a growing portfolio, Unitvero keeps the
            important work organized and easy to find.
          </p>
        </div>

        <div className="featureGrid">
          {features.map((feature) => (
            <article key={feature.title}>
              <span className="featureIcon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="stepsSection" id="how-it-works">
        <div className="sectionHeading left">
          <span className="eyebrow">GET STARTED QUICKLY</span>
          <h2>Your portfolio, organized in three steps</h2>
        </div>

        <div className="stepsGrid">
          <article>
            <span>01</span>
            <h3>Add your properties</h3>
            <p>Enter each address, unit, and expected monthly rent.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Connect tenants and leases</h3>
            <p>Keep renter details, lease dates, and rent records together.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Manage from one dashboard</h3>
            <p>
              Monitor payments, messages, applications, and property activity.
            </p>
          </article>
        </div>
      </section>

      <section className="securitySection" id="security">
        <div className="securityIcon">◎</div>
        <div>
          <span className="eyebrow">PRIVACY BUILT IN</span>
          <h2>Your rental information belongs to you</h2>
          <p>
            Unitvero is designed to keep each landlord&apos;s portfolio
            separate, protect sensitive financial information, and give you
            control over what appears on screen.
          </p>
        </div>
        <Link className="secondaryButton light" href="/signup">
          Create your account
        </Link>
      </section>

      <section className="proSection" id="pro">
        <div>
          <span className="eyebrow">UNITVERO PRO</span>
          <h2>Try the complete experience for 1 month free.</h2>
          <p>Explore advanced bookkeeping, professional documents, eSignatures, maintenance accounting, advanced rental tools and more during your free first month.</p>
        </div>
        <div className="proChecklist">
          <div>✓ Advanced bookkeeping</div>
          <div>✓ Professional documents + eSign</div>
          <div>✓ Maintenance accounting</div>
          <div>✓ Advanced rental tools</div>
          <Link className="primaryButton" href="/signup">Start my free month <span>→</span></Link>
        </div>
      </section>

      <section className="finalCta">
        <span className="eyebrow">READY TO GET ORGANIZED?</span>
        <h2>Manage your rentals with confidence.</h2>
        <p>
          Everything you need to stay on top of your portfolio—without the
          clutter.
        </p>
        <Link className="primaryButton inverse" href="/signup">
          Get started with Unitvero <span>→</span>
        </Link>
      </section>

      
      {showDemo && (
        <div className="uvDemoOverlay" role="dialog" aria-modal="true" aria-label="Unitvero feature demo">
          <div className="uvDemoModal">
            <button type="button" className="uvDemoClose" onClick={() => setShowDemo(false)} aria-label="Close demo">×</button>
            <div className="uvDemoHeading">
              <span className="sectionTag">UNITVERO DEMO</span>
              <h2>See Unitvero in action.</h2>
              <p>Explore rent collection, property management, tenants, maintenance, bookkeeping, documents, messaging, and the tenant portal.</p>
            </div>
            <div className="uvDemoVideo">
              <video controls playsInline preload="metadata">
                <source src="/unitvero-demo.mp4" type="video/mp4" />
              </video>
              <div className="uvDemoFallback">
                <span>▶</span>
                <b>Unitvero Feature Demo</b>
                <small>Add the finished walkthrough video as <strong>public/unitvero-demo.mp4</strong>.</small>
              </div>
            </div>
            <div className="uvDemoFeatures">
              <span>Rent Collection</span>
              <span>Properties</span>
              <span>Tenants</span>
              <span>Maintenance</span>
              <span>Bookkeeping</span>
              <span>Documents &amp; Leases</span>
              <span>Messaging</span>
              <span>Tenant Portal</span>
            </div>
          </div>
        </div>
      )}

<footer>
        <Link className="brand" href="/">
          unit<span>vero</span>
        </Link>
        <p>Property management made clearer.</p>
        <div>
          <Link href="/login">Sign in</Link>
          <a href="#features">Features</a>
          <a href="#security">Privacy</a>
        </div>
      </footer>

      <style jsx global>{`
        .launchOffer {
          width: min(1180px, calc(100% - 40px));
          margin: 8px auto 0;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          border: 1px solid #5b5135;
          border-radius: 14px;
          background: linear-gradient(90deg, #11100b, #ffffff);
          color: #f7f6f1;
          box-shadow: 0 8px 28px rgba(15, 159, 143, 0.08);
        }
        .launchOfferBadge {
          padding: 5px 9px;
          border-radius: 999px;
          background: #f4c84f;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .launchOffer strong { font-size: 14px; }
        .launchOffer > span:not(.launchOfferBadge) { color: #8f918d; font-size: 13px; }
        .launchOffer a {
          color: #f4c84f;
          font-weight: 900;
          font-size: 13px;
        }
        .audienceSection {
          width: min(1180px, calc(100% - 40px));
          margin: 70px auto 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .audienceCard {
          padding: 32px;
          border: 1px solid #39362d;
          border-radius: 24px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 18px 45px rgba(11, 23, 39, .07);
        }
        .audienceCard h2 {
          margin: 8px 0 10px;
          color: #f7f6f1;
          font-size: clamp(25px, 3vw, 36px);
          letter-spacing: -.035em;
        }
        .audienceCard p {
          margin: 0 0 20px;
          color: #92948f;
          line-height: 1.7;
        }
        .textButton { color: #f4c84f; font-weight: 900; }
        .proSection {
          width: min(1180px, calc(100% - 40px));
          margin: 70px auto;
          padding: 38px;
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 30px;
          border-radius: 28px;
          background: linear-gradient(135deg, #0b0c0d, #11100b);
          color: white;
          box-shadow: 0 24px 60px rgba(11, 23, 39, .18);
        }
        .proSection h2 {
          margin: 8px 0 12px;
          font-size: clamp(30px, 4vw, 48px);
          letter-spacing: -.04em;
        }
        .proSection p { color: #aaa9a1; line-height: 1.7; max-width: 650px; }
        .proChecklist {
          display: grid;
          gap: 12px;
          align-content: center;
          padding: 22px;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 20px;
          background: rgba(255,255,255,.07);
        }
        .proChecklist div { color: #eeeade; font-weight: 700; }
        .proChecklist .primaryButton {
          margin-top: 8px;
          background: #f4c84f !important;
          color: #fff !important;
        }
        @media (max-width: 760px) {
          .audienceSection, .proSection { grid-template-columns: 1fr; }
          .launchOffer { justify-content: flex-start; }
        }


        * {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
          background: #080909;
          color: #f7f6f1;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        .homePage {
          min-height: 100vh;
          overflow: hidden;
          font-family:
            Inter,
            ui-sans-serif,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background:
            radial-gradient(
              circle at 82% 8%,
              rgba(15, 159, 143, 0.12),
              transparent 28%
            ),
            #080909;
        }
        .topNav {
          width: min(1180px, calc(100% - 40px));
          min-height: 76px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }
        .brand {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -0.06em;
        }
        .brand span {
          color: #f4c84f;
        }
        .navLinks,
        .navActions {
          display: flex;
          align-items: center;
          gap: 26px;
        }
        .navLinks a,
        .signIn {
          color: #536176;
          font-size: 14px;
          font-weight: 700;
        }
        .primaryButton,
        .secondaryButton {
          min-height: 50px;
          padding: 0 20px;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 800;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        .primaryButton {
          background: #2859c5;
          color: #fff;
          box-shadow: 0 12px 28px rgba(40, 89, 197, 0.25);
        }
        .primaryButton:hover,
        .secondaryButton:hover {
          transform: translateY(-2px);
        }
        .primaryButton.small {
          min-height: 42px;
          padding: 0 16px;
          font-size: 14px;
        }
        .secondaryButton {
          border: 1px solid #d8e0eb;
          background: #fff;
          color: #24334b;
        }
        .hero {
          width: min(1180px, calc(100% - 40px));
          margin: 72px auto 80px;
          display: grid;
          grid-template-columns: minmax(0, 0.88fr) minmax(530px, 1.12fr);
          align-items: center;
          gap: 66px;
        }
        .eyebrow {
          display: inline-block;
          color: #f4c84f;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }
        .hero h1 {
          max-width: 630px;
          margin: 17px 0 22px;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 0.99;
          letter-spacing: -0.055em;
        }
        .hero h1 span {
          display: block;
          color: #f4c84f;
        }
        .heroCopy > p {
          max-width: 590px;
          margin: 0;
          color: #617086;
          font-size: 18px;
          line-height: 1.7;
        }
        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }
        .trustRow {
          margin-top: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }
        .dashboardPreview {
          position: relative;
          border: 1px solid #dce4ef;
          border-radius: 24px;
          background: #fff;
          padding: 22px;
          box-shadow: 0 35px 80px rgba(29, 50, 85, 0.16);
        }
        .dashboardPreview:before {
          content: "";
          position: absolute;
          inset: -18px;
          z-index: -1;
          border-radius: 36px;
          background: linear-gradient(
            135deg,
            rgba(53, 103, 218, 0.12),
            rgba(33, 177, 132, 0.08)
          );
        }
        .previewTop,
        .previewTop > div,
        .previewCardTitle,
        .previewFooter,
        .previewFooter > div,
        .moneyRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .previewTop > div {
          justify-content: flex-start;
          gap: 10px;
        }
        .previewLogo {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #2859c5;
          color: #fff;
          font-weight: 900;
        }
        .previewAvatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ecf2ff;
          color: #315da8;
          font-size: 11px;
          font-weight: 900;
        }
        .previewStats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 20px 0;
        }
        .previewStats article {
          border: 1px solid #e6ebf2;
          border-radius: 14px;
          padding: 14px;
          background: #fbfcfe;
        }
        .previewStats span,
        .previewStats small {
          display: block;
          color: #7a8799;
          font-size: 10px;
        }
        .previewStats b {
          display: block;
          margin: 6px 0 4px;
          font-size: 21px;
        }
        .previewGrid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 12px;
        }
        .previewGrid > article {
          min-width: 0;
          border: 1px solid #e6ebf2;
          border-radius: 15px;
          padding: 16px;
        }
        .previewCardTitle small,
        .activityCard > small {
          display: block;
          color: #8390a2;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }
        .previewCardTitle b {
          display: block;
          margin-top: 4px;
          font-size: 13px;
        }
        .previewCardTitle strong {
          color: #1f9b72;
          font-size: 18px;
        }
        .progressTrack {
          height: 7px;
          margin: 18px 0;
          overflow: hidden;
          border-radius: 999px;
          background: #e8edf3;
        }
        .progressTrack span {
          display: block;
          width: 82%;
          height: 100%;
          background: #28a47a;
        }
        .moneyRow {
          margin-top: 9px;
          color: #66758a;
          font-size: 11px;
        }
        .moneyRow b {
          color: #233149;
        }
        .activityCard > div {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 12px;
        }
        .activityCard i {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          font-style: normal;
          font-size: 11px;
        }
        .activityCard i.#f4c84f {
          background: #e3f8ef;
          color: #14845f;
        }
        .activityCard i.#f4c84f {
          background: #e7efff;
          color: #f4c84f;
        }
        .activityCard i.#f4c84f {
          background: #fff0df;
          color: #cf741f;
        }
        .activityCard span {
          display: grid;
          gap: 2px;
          min-width: 0;
        }
        .activityCard b {
          font-size: 10px;
          white-space: nowrap;
        }
        .activityCard small {
          color: #8a96a7;
          font-size: 9px;
        }
        .previewFooter {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #f4f7fb;
          color: #64748b;
          font-size: 11px;
        }
        .previewFooter > div {
          gap: 7px;
          color: #237d60;
        }
        .previewFooter i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #28a47a;
        }
        .metricsStrip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: #172d57;
          color: #fff;
        }
        .metricsStrip > div {
          padding: 26px;
          text-align: center;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }
        .metricsStrip b,
        .metricsStrip span {
          display: block;
        }
        .metricsStrip span {
          margin-top: 5px;
          color: #b8c6dc;
          font-size: 13px;
        }
        .featuresSection,
        .stepsSection {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 110px 0;
        }
        .sectionHeading {
          max-width: 720px;
          margin: 0 auto 50px;
          text-align: center;
        }
        .sectionHeading.left {
          max-width: 680px;
          margin-left: 0;
          text-align: left;
        }
        .sectionHeading h2,
        .securitySection h2,
        .finalCta h2 {
          margin: 12px 0;
          font-size: clamp(34px, 4vw, 50px);
          letter-spacing: -0.04em;
        }
        .sectionHeading p,
        .securitySection p,
        .finalCta p {
          color: #66758a;
          font-size: 17px;
          line-height: 1.7;
        }
        .featureGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .featureGrid article {
          border: 1px solid #e1e7ef;
          border-radius: 18px;
          background: #fff;
          padding: 26px;
          box-shadow: 0 10px 28px rgba(31, 50, 81, 0.05);
        }
        .featureIcon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #edf3ff;
          color: #315da8;
          font-weight: 900;
        }
        .featureGrid h3 {
          margin: 18px 0 8px;
          font-size: 18px;
        }
        .featureGrid p,
        .stepsGrid p {
          margin: 0;
          color: #6b788b;
          line-height: 1.65;
        }
        .stepsSection {
          padding-top: 40px;
        }
        .stepsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stepsGrid article {
          border-top: 2px solid #d9e3f3;
          padding: 24px 8px 0 0;
        }
        .stepsGrid article > span {
          color: #f4c84f;
          font-weight: 900;
        }
        .stepsGrid h3 {
          margin: 18px 0 9px;
        }
        .securitySection {
          width: min(1120px, calc(100% - 40px));
          margin: 20px auto 110px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 28px;
          border-radius: 24px;
          padding: 36px;
          background: #172d57;
          color: #fff;
        }
        .securitySection h2 {
          margin: 8px 0;
          font-size: clamp(28px, 3vw, 40px);
        }
        .securitySection p {
          max-width: 710px;
          margin: 0;
          color: #bdc9dc;
          font-size: 15px;
        }
        .securityIcon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.1);
          font-size: 25px;
        }
        .secondaryButton.light {
          border-color: rgba(255, 255, 255, 0.25);
          background: transparent;
          color: #fff;
        }
        .finalCta {
          padding: 100px 20px;
          text-align: center;
          background: linear-gradient(135deg, #2859c5, #173b88);
          color: #fff;
        }
        .finalCta .eyebrow {
          color: #c9d9ff;
        }
        .finalCta h2 {
          margin-top: 14px;
        }
        .finalCta p {
          color: #d2ddf4;
        }
        .primaryButton.inverse {
          margin-top: 16px;
          background: #fff;
          color: #214da9;
        }
        footer {
          width: min(1120px, calc(100% - 40px));
          min-height: 100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        footer p {
          color: #738196;
          font-size: 13px;
        }
        footer > div {
          display: flex;
          gap: 20px;
          color: #536176;
          font-size: 13px;
          font-weight: 700;
        }
        @media (max-width: 960px) {
          .navLinks {
            display: none;
          }
          .hero {
            grid-template-columns: 1fr;
            margin-top: 48px;
          }
          .heroCopy {
            text-align: center;
          }
          .heroCopy > p {
            margin-left: auto;
            margin-right: auto;
          }
          .heroActions,
          .trustRow {
            justify-content: center;
          }
          .dashboardPreview {
            width: min(620px, 100%);
            margin: 0 auto;
          }
          .featureGrid {
            grid-template-columns: repeat(2, 1fr);
          }
          .securitySection {
            grid-template-columns: auto 1fr;
          }
          .securitySection .secondaryButton {
            grid-column: 2;
            justify-self: start;
          }
        }
        @media (max-width: 650px) {
          .topNav {
            width: min(100% - 28px, 1180px);
          }
          .signIn {
            display: none;
          }
          .hero {
            width: min(100% - 28px, 1180px);
            margin-bottom: 56px;
            gap: 42px;
          }
          .hero h1 {
            font-size: 46px;
          }
          .heroCopy > p {
            font-size: 16px;
          }
          .heroActions {
            display: grid;
          }
          .dashboardPreview {
            padding: 14px;
            border-radius: 18px;
          }
          .previewStats {
            grid-template-columns: 1fr 1fr;
          }
          .previewStats article:last-child {
            grid-column: 1 / -1;
          }
          .previewGrid {
            grid-template-columns: 1fr;
          }
          .metricsStrip,
          .featureGrid,
          .stepsGrid {
            grid-template-columns: 1fr;
          }
          .metricsStrip > div {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          }
          .featuresSection,
          .stepsSection {
            width: min(100% - 28px, 1120px);
            padding: 76px 0;
          }
          .securitySection {
            width: min(100% - 28px, 1120px);
            grid-template-columns: 1fr;
            padding: 28px;
          }
          .securitySection .secondaryButton {
            grid-column: auto;
            justify-self: stretch;
          }
          footer {
            width: min(100% - 28px, 1120px);
            flex-direction: column;
            padding: 30px 0;
          }
        }

/* =========================================================
   UNITVERO HOME — EXACT REFERENCE DIRECTION
   Premium black + gold, Inter font, compact SaaS layout.
   ========================================================= */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.homePage{
  --black:#060708;
  --black2:#0b0d0e;
  --panel:#101314;
  --panel2:#141718;
  --gold:#f4c84f;
  --gold2:#dcae36;
  --white:#f7f6f1;
  --muted:#9b9d99;
  --line:rgba(244,200,79,.24);
  min-height:100vh !important;
  background:
    radial-gradient(circle at 70% 8%,rgba(244,200,79,.09),transparent 25%),
    radial-gradient(circle at 15% 40%,rgba(244,200,79,.045),transparent 25%),
    #060708 !important;
  color:var(--white) !important;
  font-family:Inter,Arial,sans-serif !important;
}
.homePage *{font-family:Inter,Arial,sans-serif !important;box-sizing:border-box}
.homePage .topNav{
  width:min(1180px,calc(100% - 36px)) !important;
  margin:0 auto !important;
  min-height:72px !important;
  border-bottom:1px solid rgba(244,200,79,.12) !important;
}
.homePage .brand{
  color:#fff !important;
  font-size:21px !important;
  font-weight:900 !important;
  letter-spacing:-.055em !important;
}
.homePage .brand::before{
  content:"⌂";
  display:inline-grid;
  place-items:center;
  width:27px;height:27px;
  margin-right:8px;
  border:1px solid var(--gold);
  border-radius:8px;
  color:var(--gold);
  font-size:16px;
  vertical-align:-4px;
}
.homePage .brand span{color:var(--gold) !important}
.homePage .navLinks a{
  color:#aeb2ae !important;
  font-size:12px !important;
}
.homePage .navLinks a:hover{color:#fff !important}
.homePage .signIn{
  border:1px solid rgba(244,200,79,.34) !important;
  color:#f7f6f1 !important;
  background:#0d1011 !important;
  border-radius:9px !important;
}
.homePage .primaryButton{
  background:linear-gradient(135deg,#f7d46b,#dcae36) !important;
  color:#111 !important;
  border:1px solid #f8dc88 !important;
  border-radius:9px !important;
  font-weight:900 !important;
  box-shadow:0 9px 22px rgba(220,174,54,.15) !important;
}
.homePage .launchOffer{
  width:min(1120px,calc(100% - 36px)) !important;
  margin:15px auto 0 !important;
  padding:10px 14px !important;
  background:linear-gradient(90deg,#151208,#0c0e0f) !important;
  border:1px solid rgba(244,200,79,.34) !important;
  border-radius:11px !important;
  color:#eee9dc !important;
}
.homePage .launchOfferBadge{
  background:#f4c84f !important;
  color:#111 !important;
}
.homePage .launchOffer a{color:#f4c84f !important}
.homePage .hero{
  width:min(1180px,calc(100% - 36px)) !important;
  margin:28px auto 0 !important;
  display:grid !important;
  grid-template-columns:.88fr 1.12fr !important;
  gap:22px !important;
  align-items:stretch !important;
}
.homePage .heroCopy{
  padding:32px 10px 20px 2px !important;
}
.homePage .eyebrow{
  color:#f4c84f !important;
  letter-spacing:.12em !important;
  font-size:9px !important;
  font-weight:900 !important;
}
.homePage .hero h1{
  color:#fff !important;
  font-size:clamp(42px,5.3vw,72px) !important;
  line-height:.98 !important;
  letter-spacing:-.065em !important;
  margin:12px 0 18px !important;
  max-width:600px !important;
}
.homePage .hero h1 span{color:#f4c84f !important}
.homePage .heroCopy>p{
  color:#a4a7a3 !important;
  font-size:14px !important;
  line-height:1.65 !important;
  max-width:560px !important;
}
.homePage .secondaryButton{
  background:#0d1011 !important;
  color:#eee9dc !important;
  border:1px solid rgba(244,200,79,.27) !important;
  border-radius:9px !important;
}
.homePage .trustRow span{color:#969a96 !important;font-size:10px !important}
.homePage .dashboardPreview{
  min-height:430px !important;
  padding:18px !important;
  border:1px solid rgba(244,200,79,.40) !important;
  border-radius:16px !important;
  background:
    linear-gradient(145deg,rgba(244,200,79,.06),transparent 30%),
    #0a0c0d !important;
  box-shadow:0 28px 70px rgba(0,0,0,.34) !important;
}
.homePage .previewTop{
  padding-bottom:12px !important;
  border-bottom:1px solid rgba(244,200,79,.14) !important;
}
.homePage .previewLogo{
  background:#f4c84f !important;
  color:#111 !important;
}
.homePage .previewStats{
  gap:8px !important;
  margin-top:12px !important;
}
.homePage .previewStats article,
.homePage .collectionCard,
.homePage .activityCard{
  background:#101314 !important;
  border:1px solid rgba(244,200,79,.20) !important;
  border-radius:10px !important;
  color:#f7f6f1 !important;
}
.homePage .previewStats article span,
.homePage .previewStats article small,
.homePage .activityCard>small,
.homePage .moneyRow span{color:#8f9490 !important}
.homePage .previewStats article b{color:#fff !important}
.homePage .previewStats article b,
.homePage .collectionCard strong{color:#f4c84f !important}
.homePage .progressTrack{
  background:#1a1d1e !important;
  border:1px solid rgba(244,200,79,.10) !important;
}
.homePage .progressTrack span{
  background:linear-gradient(90deg,#dcae36,#f7d46b) !important;
}
.homePage .activityCard i.#f4c84f,
.homePage .activityCard i.#f4c84f,
.homePage .activityCard i.#f4c84f{
  background:rgba(244,200,79,.10) !important;
  color:#f4c84f !important;
}
.homePage .previewFooter{
  border-top-color:rgba(244,200,79,.13) !important;
  color:#949893 !important;
}
.homePage .previewFooter b{color:#f4c84f !important}
.homePage .metricsStrip{
  width:min(1180px,calc(100% - 36px)) !important;
  margin:18px auto 0 !important;
  background:#0b0d0e !important;
  border:1px solid rgba(244,200,79,.18) !important;
  border-radius:12px !important;
}
.homePage .metricsStrip div{border-color:rgba(244,200,79,.12) !important}
.homePage .metricsStrip b{color:#f4c84f !important}
.homePage .metricsStrip span{color:#858a86 !important}
.homePage .audienceSection,
.homePage .featuresSection,
.homePage .stepsSection,
.homePage .securitySection,
.homePage .proSection{
  width:min(1180px,calc(100% - 36px)) !important;
}
.homePage .audienceCard,
.homePage .featureGrid article,
.homePage .stepsGrid article{
  background:linear-gradient(145deg,#0d1011,#121516) !important;
  border:1px solid rgba(244,200,79,.20) !important;
  color:#f7f6f1 !important;
  border-radius:13px !important;
}
.homePage .audienceCard h2,
.homePage .sectionHeading h2,
.homePage .featureGrid h3,
.homePage .stepsGrid h3{
  color:#f7f6f1 !important;
}
.homePage .audienceCard p,
.homePage .sectionHeading p,
.homePage .featureGrid p,
.homePage .stepsGrid p{
  color:#949893 !important;
}
.homePage .textButton{color:#f4c84f !important}
.homePage .featureIcon{
  background:rgba(244,200,79,.08) !important;
  color:#f4c84f !important;
  border:1px solid rgba(244,200,79,.18) !important;
}
.homePage .securitySection{
  background:#101314 !important;
  border:1px solid rgba(244,200,79,.22) !important;
}
.homePage .securityIcon{color:#f4c84f !important}
.homePage .proSection{
  background:linear-gradient(135deg,#171306,#0c0e0f 68%) !important;
  border:1px solid rgba(244,200,79,.48) !important;
  color:#fff !important;
  border-radius:16px !important;
}
.homePage .proSection h2{color:#fff !important}
.homePage .proSection p{color:#a7aaa5 !important}
.homePage .proChecklist{
  background:rgba(0,0,0,.24) !important;
  border-color:rgba(244,200,79,.18) !important;
}
.homePage .proChecklist div{color:#eee9dc !important}
.homePage .finalCta{
  background:linear-gradient(135deg,#f4c84f,#dcae36) !important;
  color:#111 !important;
  border-radius:16px !important;
}
.homePage .finalCta h2,
.homePage .finalCta p{color:#111 !important}
.homePage footer{
  border-top-color:rgba(244,200,79,.15) !important;
  color:#858a86 !important;
}
.homePage footer a{color:#aeb1ac !important}
.homePage footer .brand{color:#fff !important}
@media(max-width:850px){
  .homePage .hero{grid-template-columns:1fr !important}
  .homePage .heroCopy{padding-top:18px !important}
}
@media(max-width:650px){
  .homePage .navLinks{display:none !important}
  .homePage .hero h1{font-size:44px !important}
  .homePage .hero,
  .homePage .audienceSection,
  .homePage .featuresSection,
  .homePage .stepsSection,
  .homePage .securitySection,
  .homePage .proSection,
  .homePage .metricsStrip{width:min(100% - 24px,1180px) !important}
}


/* FINAL PALETTE LOCK — NO BLUE / GREEN / ORANGE / PURPLE / TEAL */
.unitveroModern,
.unitveroModern *{
  --blue:#f4c84f !important;
  --green:#f4c84f !important;
  --orange:#f4c84f !important;
  --purple:#f4c84f !important;
  --teal:#f4c84f !important;
  --cyan:#f4c84f !important;
}
.unitveroModern .green,
.unitveroModern .blue,
.unitveroModern .orange,
.unitveroModern .purple,
.unitveroModern .teal,
.unitveroModern .cyan{
  color:#f4c84f !important;
  background-color:rgba(244,200,79,.08) !important;
  border-color:rgba(244,200,79,.20) !important;
}
.unitveroModern [class*="blue"],
.unitveroModern [class*="green"],
.unitveroModern [class*="orange"],
.unitveroModern [class*="purple"],
.unitveroModern [class*="teal"],
.unitveroModern [class*="cyan"]{
  color:#f4c84f !important;
  border-color:rgba(244,200,79,.20) !important;
}
.unitveroModern svg [fill],
.unitveroModern svg [stroke]{
  stroke:#f4c84f !important;
  fill:currentColor !important;
}


/* FONT LOCK — INTER, matching the generated reference */
html, body,
.unitveroModern,
.unitveroModern *,
.homePage,
.homePage *{
  font-family:Inter,Arial,sans-serif !important;
  font-synthesis:none !important;
}

      

        /* UNITVERO HOMEPAGE — FINAL REFERENCE LOCK */
        body{background:#030404!important;color:#f5f2e9!important}
        .homePage,.unitveroHome{background:#030404!important;color:#f5f2e9!important}
        .homePage *,.unitveroHome *{font-family:Inter,Arial,sans-serif!important}
        .homePage .blue,.homePage .green,.homePage .teal,.homePage .cyan,
        .homePage .purple,.homePage .orange{
          color:#f4c84f!important;background-color:transparent!important;
          border-color:rgba(244,200,79,.25)!important;
        }
        .heroImage,.heroVisual,.luxuryHouse,.houseScene{min-height:560px!important}
        .luxuryHouse,.houseScene{
          border:1px solid rgba(244,200,79,.28)!important;
          border-radius:14px!important;
          overflow:hidden!important;
          transform:scale(1.02);
          background:
            linear-gradient(rgba(3,4,4,.15),rgba(3,4,4,.32)),
            url("/images/unitvero-house.jpg") center/cover no-repeat,
            linear-gradient(145deg,#3b3527,#090b0c)!important;
        }
        .phone{
          width:170px!important;height:315px!important;
          transform:rotate(5deg) scale(1.08)!important;
        }
        .phoneTenant{transform:rotate(-5deg) scale(1.08)!important}
        .portalCard{min-height:350px!important}
        .propertyPhoto{
          background:
            url("/images/unitvero-house.jpg") center/cover no-repeat,
            linear-gradient(135deg,#4b4a40,#181a19)!important;
        }
        .uvDemoOverlay{
          position:fixed!important;inset:0!important;z-index:99999!important;
          display:grid!important;place-items:center!important;padding:24px!important;
          background:rgba(0,0,0,.84)!important;backdrop-filter:blur(10px)!important;
        }
        .uvDemoModal{
          position:relative!important;width:min(1000px,100%)!important;
          max-height:92vh!important;overflow:auto!important;
          padding:28px!important;border-radius:18px!important;
          background:#090a0a!important;
          border:1px solid rgba(244,200,79,.5)!important;
          box-shadow:0 35px 100px rgba(0,0,0,.75)!important;
        }
        .uvDemoClose{
          position:absolute!important;right:14px!important;top:12px!important;
          width:38px!important;height:38px!important;border-radius:50%!important;
          border:1px solid rgba(244,200,79,.35)!important;background:#111313!important;
          color:#f4c84f!important;font-size:27px!important;cursor:pointer!important;
        }
        .uvDemoHeading{padding-right:45px!important;margin-bottom:16px!important}
        .uvDemoHeading h2{margin:5px 0!important;color:#fff!important;font-size:30px!important;letter-spacing:-.04em!important}
        .uvDemoHeading p{margin:0!important;color:#969893!important;font-size:11px!important;line-height:1.6!important}
        .uvDemoVideo{
          position:relative!important;min-height:450px!important;
          border:1px solid rgba(244,200,79,.25)!important;border-radius:12px!important;
          overflow:hidden!important;background:#020303!important;
        }
        .uvDemoVideo video{display:block!important;width:100%!important;height:450px!important;background:#020303!important}
        .uvDemoFallback{
          position:absolute!important;inset:0!important;display:flex!important;
          flex-direction:column!important;align-items:center!important;justify-content:center!important;
          gap:8px!important;background:rgba(2,3,3,.78)!important;text-align:center!important;
          pointer-events:none!important;
        }
        .uvDemoFallback span{
          width:66px!important;height:66px!important;border-radius:50%!important;
          display:grid!important;place-items:center!important;
          background:#f4c84f!important;color:#111!important;font-size:22px!important;
        }
        .uvDemoFallback b{color:#fff!important;font-size:17px!important}
        .uvDemoFallback small{color:#8e918b!important;font-size:9px!important}
        .uvDemoFallback strong{color:#f4c84f!important}
        .uvDemoFeatures{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin-top:13px!important}
        .uvDemoFeatures span{
          padding:8px 10px!important;border-radius:7px!important;
          background:#101212!important;border:1px solid rgba(244,200,79,.18)!important;
          color:#b9b8b0!important;font-size:8px!important;
        }
        .socials a{color:#f4c84f!important}
        @media(max-width:700px){
          .heroImage,.heroVisual,.luxuryHouse,.houseScene{min-height:430px!important}
          .phone{transform:scale(1)!important}.phoneTenant{transform:scale(1)!important}
          .uvDemoOverlay{padding:12px!important}.uvDemoModal{padding:18px!important}
          .uvDemoVideo{min-height:240px!important}.uvDemoVideo video{height:240px!important}
        }
        `}
        </style>
    </main>
  );
}
