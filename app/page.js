"use client";

import Link from "next/link";

const gold = "#FFD84A";
const gold2 = "#F5C842";
const black = "#050606";
const panel = "#0B0D0D";
const border = "rgba(255,216,74,.72)";

function Icon({ type }) {
  const common = {
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    rent: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8M8 13h8M8 16h4" />
      </>
    ),
    maintenance: (
      <>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-3 3-2.3-2.3 3-3Z" />
      </>
    ),
    screening: (
      <>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 5 5" />
      </>
    ),
    lease: (
      <>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M15 3v4h4M9 11h6M9 15h6M9 18h4" />
      </>
    ),
    reports: (
      <>
        <path d="M5 19V9M10 19V5M15 19v-7M20 19V3" />
      </>
    ),
    messages: (
      <>
        <path d="M4 5h16v11H8l-4 4z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    crown: (
      <>
        <path d="m4 7 4 3 4-6 4 6 4-3-2 12H6z" />
        <path d="M6 19h12" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    play: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return <svg {...common}>{icons[type]}</svg>;
}

function Logo() {
  return (
    <div className="logo">
      <div className="logoMark">
        <span />
      </div>
      <span>Unitvero</span>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <div className="featureIcon">
        <Icon type={icon} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function CheckItem({ children }) {
  return (
    <li>
      <span className="check">
        <Icon type="check" />
      </span>
      {children}
    </li>
  );
}

export default function HomePage() {
  return (
    <main className="site">
      <header className="topbar">
        <Link href="/" className="brandLink">
          <Logo />
        </Link>

        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
        </nav>

        <div className="topActions">
          <Link href="/login" className="loginButton">
            Log In
          </Link>
          <Link href="/login" className="getStarted">
            Get Started <Icon type="arrow" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="heroImage" />

        <div className="heroOverlay" />

        <div className="heroContent">
          <div className="eyebrow">
            PROPERTY MANAGEMENT MADE SIMPLE
          </div>

          <h1>
            Smarter
            <br />
            Property
            <br />
            <span>Management</span>
            <br />
            Starts Here.
          </h1>

          <p className="heroText">
            Everything landlords and tenants need in one modern platform.
            Manage properties, collect rent, handle maintenance, track
            finances, and stay connected — all in one place.
          </p>

          <div className="heroButtons">
            <Link href="/login" className="primaryButton">
              Get Started
              <Icon type="arrow" />
            </Link>

            <a href="#demo" className="secondaryButton">
              <span className="playCircle">
                <Icon type="play" />
              </span>
              Watch Demo
            </a>
          </div>

          <div className="heroNote">
            <span>1 Month of Pro Free</span>
            <b>•</b>
            <span>No Credit Card Required</span>
          </div>
        </div>

        <div className="revenueCard">
          <div className="smallLabel">Monthly Revenue</div>
          <strong>$48,750</strong>
          <span className="growth">↑ 12% from last month</span>

          <div className="miniBars">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="occupancyCard">
          <div>
            <div className="smallLabel">Occupancy Rate</div>
            <strong>92%</strong>
            <span className="growth">↑ 4% from last month</span>
          </div>

          <div className="ring">
            <span>92%</span>
          </div>
        </div>

        <div className="propertyCard">
          <img src="/unitvero-hero-house.png" alt="Property" />
          <div>
            <small>Property Managed</small>
            <strong>1234 Maple St.</strong>
            <span>Unit 2A</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="featuresSection" id="features">
        <div className="featuresGrid">
          <Feature
            icon="rent"
            title="Rent Collection"
            text="Get paid on time, every time."
          />
          <Feature
            icon="maintenance"
            title="Maintenance"
            text="Submit & track requests easily."
          />
          <Feature
            icon="screening"
            title="Tenant Screening"
            text="Find reliable tenants."
          />
          <Feature
            icon="lease"
            title="Lease Management"
            text="Create, sign, and store leases."
          />
          <Feature
            icon="reports"
            title="Financial Reports"
            text="Track income, expenses, and profit."
          />
          <Feature
            icon="messages"
            title="Secure Messaging"
            text="Stay connected in one place."
          />
        </div>
      </section>

      {/* LANDLORD / TENANT */}
      <section className="audienceSection" id="about">
        <div className="audienceCard">
          <div className="audienceCopy">
            <div className="sectionEyebrow">FOR LANDLORDS</div>

            <h2>
              More Control.
              <br />
              Less Work.
            </h2>

            <ul>
              <CheckItem>Track rent & expenses</CheckItem>
              <CheckItem>Manage properties</CheckItem>
              <CheckItem>Screen tenants</CheckItem>
              <CheckItem>Handle maintenance</CheckItem>
              <CheckItem>Generate reports</CheckItem>
              <CheckItem>Use on web & mobile</CheckItem>
            </ul>

            <Link href="/login" className="smallPrimary">
              Get Started as a Landlord
              <Icon type="arrow" />
            </Link>
          </div>

          <div className="phoneArea landlordPhone">
            <div className="phoneGlow" />
            <img
              src="/unitvero-landlord-phone.png"
              alt="Unitvero landlord mobile app"
            />
          </div>
        </div>

        <div className="audienceCard">
          <div className="audienceCopy">
            <div className="sectionEyebrow">FOR TENANTS</div>

            <h2>
              A Better Renting
              <br />
              Experience.
            </h2>

            <ul>
              <CheckItem>Pay rent online</CheckItem>
              <CheckItem>Submit maintenance requests</CheckItem>
              <CheckItem>Access documents</CheckItem>
              <CheckItem>Receive notifications</CheckItem>
              <CheckItem>Communicate with your landlord</CheckItem>
              <CheckItem>Stay organized</CheckItem>
            </ul>

            <Link href="/login" className="smallPrimary">
              Get Started as a Tenant
              <Icon type="arrow" />
            </Link>
          </div>

          <div className="phoneArea tenantPhone">
            <div className="phoneGlow" />
            <img
              src="/unitvero-tenant-phone.png"
              alt="Unitvero tenant mobile app"
            />
          </div>
        </div>
      </section>

      {/* PRO */}
      <section className="proSection" id="pricing">
        <div className="crownBox">
          <Icon type="crown" />
        </div>

        <div className="proText">
          <div className="sectionEyebrow">UNITVERO PRO</div>
          <h2>Try Unitvero Pro Free for 1 Month</h2>
          <p>
            Unlock advanced features and take your property management to the
            next level.
          </p>
        </div>

        <div className="proFeatures">
          <span>▣ Advanced Reports</span>
          <span>◉ Priority Support</span>
          <span>♙ Unlimited Properties</span>
          <span>⌁ Custom Branding</span>
        </div>

        <Link href="/login" className="proButton">
          Get 1 Month Free
          <Icon type="arrow" />
        </Link>
      </section>

      {/* EXTRA FEATURES */}
      <section className="toolsSection" id="resources">
        <div className="sectionHeading">
          <div className="sectionEyebrow">BUILT FOR REAL LANDLORDS</div>
          <h2>Everything You Need to Run Your Rentals.</h2>
          <p>
            Unitvero brings your properties, tenants, documents, communication,
            payments, and maintenance together.
          </p>
        </div>

        <div className="toolsGrid">
          <div className="toolCard">
            <Icon type="lease" />
            <h3>Landlord Documents</h3>
            <p>
              Create and organize leases, notices, letters, forms, and other
              rental documents.
            </p>
          </div>

          <div className="toolCard">
            <Icon type="messages" />
            <h3>Tenant Alerts</h3>
            <p>
              Send important announcements, reminders, notices, and alerts to
              tenants.
            </p>
          </div>

          <div className="toolCard">
            <Icon type="maintenance" />
            <h3>Maintenance Management</h3>
            <p>
              Track maintenance requests from submission through completion.
            </p>
          </div>

          <div className="toolCard">
            <Icon type="reports" />
            <h3>Financial Tracking</h3>
            <p>
              Monitor rent, expenses, outstanding balances, and portfolio
              performance.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className="demoSection" id="demo">
        <div className="demoContent">
          <div className="sectionEyebrow">SEE UNITVERO IN ACTION</div>

          <h2>
            Property management
            <br />
            made simple.
          </h2>

          <p>
            See how landlords can manage properties, collect rent, communicate
            with tenants, create documents, handle maintenance, and stay
            organized from one place.
          </p>

          <Link href="/login" className="primaryButton">
            Start Managing
            <Icon type="arrow" />
          </Link>
        </div>

        <div className="videoBox">
          <div className="videoPlay">
            <Icon type="play" />
          </div>
          <span>Unitvero Product Demo</span>
          <small>Watch the full platform walkthrough</small>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonialSection">
        <div className="sectionHeading">
          <h2>Trusted by Landlords and Tenants</h2>
          <p>See what our users are saying about Unitvero.</p>
        </div>

        <div className="testimonialGrid">
          <div className="testimonial">
            <div className="avatar">LR</div>
            <div>
              <strong>Landon R.</strong>
              <small>Property Owner</small>
            </div>

            <p>
              “Unitvero has made managing my properties so much easier.
              Everything I need is in one place.”
            </p>

            <div className="stars">★★★★★</div>
          </div>

          <div className="testimonial">
            <div className="avatar">TM</div>
            <div>
              <strong>Tyesha M.</strong>
              <small>Tenant</small>
            </div>

            <p>
              “I love how easy it is to pay rent and submit maintenance
              requests! Great app!”
            </p>

            <div className="stars">★★★★★</div>
          </div>

          <div className="testimonial">
            <div className="avatar">MT</div>
            <div>
              <strong>Marcus T.</strong>
              <small>Real Estate Investor</small>
            </div>

            <p>
              “Clean, modern, and powerful. Exactly what I needed to manage my
              portfolio.”
            </p>

            <div className="stars">★★★★★</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footerBrand">
          <Logo />
          <p>Manage Today. Build Tomorrow.</p>
        </div>

        <div className="footerLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="socials">
          <a href="#" aria-label="Instagram">
            Instagram
          </a>
          <a href="#" aria-label="LinkedIn">
            LinkedIn
          </a>
          <a href="#" aria-label="Facebook">
            Facebook
          </a>
        </div>

        <div className="storeButtons">
          <div className="store">
            <small>Download on the</small>
            <strong>App Store</strong>
          </div>

          <div className="store">
            <small>GET IT ON</small>
            <strong>Google Play</strong>
          </div>
        </div>

        <div className="copyright">
          © 2026 Unitvero. All rights reserved.
        </div>
      </footer>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

        :root {
          --black: #050606;
          --panel: #0b0d0d;
          --gold: #ffd84a;
          --gold2: #f5c842;
          --white: #f7f5ef;
          --muted: #b8b7ae;
          --border: rgba(255, 216, 74, 0.72);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          padding: 0;
          background: var(--black);
          color: var(--white);
          font-family: "Inter", Arial, sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .site {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(255, 216, 74, 0.07),
              transparent 25%
            ),
            var(--black);
          overflow: hidden;
        }

        .topbar {
          height: 82px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          padding: 0 44px;
          gap: 40px;
        }

        .brandLink {
          display: block;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .logoMark {
          width: 37px;
          height: 37px;
          position: relative;
          border: 5px solid var(--gold);
          border-bottom: 0;
          border-radius: 7px 7px 3px 3px;
          transform: translateY(2px);
        }

        .logoMark:before {
          content: "";
          position: absolute;
          left: 5px;
          right: 5px;
          bottom: -1px;
          height: 20px;
          border-left: 5px solid var(--gold);
          border-right: 5px solid var(--gold);
        }

        .logoMark span {
          position: absolute;
          width: 11px;
          height: 11px;
          background: var(--gold);
          transform: rotate(45deg);
          top: -8px;
          left: 8px;
        }

        .nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 42px;
          margin-left: auto;
        }

        .nav a {
          font-size: 14px;
          color: #eee;
          transition: color 0.2s ease;
        }

        .nav a:hover {
          color: var(--gold);
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .loginButton,
        .getStarted {
          height: 46px;
          padding: 0 27px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .loginButton {
          border: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.38);
        }

        .getStarted {
          background: linear-gradient(180deg, #ffe46f, #f8c92f);
          color: #080808;
          min-width: 165px;
        }

        .getStarted svg,
        .primaryButton svg,
        .smallPrimary svg,
        .proButton svg {
          width: 20px;
          height: 20px;
          margin-left: 10px;
        }

        .hero {
          min-height: 650px;
          height: 650px;
          position: relative;
          isolation: isolate;
          border-bottom: 1px solid rgba(255, 216, 74, 0.35);
        }

        .heroImage {
          position: absolute;
          inset: 0;
          z-index: -3;
          background-image: url("/unitvero-hero-house.png");
          background-size: cover;
          background-position: center right;
          transform: scale(1.02);
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(
              90deg,
              rgba(5, 6, 6, 0.98) 0%,
              rgba(5, 6, 6, 0.91) 24%,
              rgba(5, 6, 6, 0.54) 48%,
              rgba(5, 6, 6, 0.12) 80%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.52),
              rgba(0, 0, 0, 0.1) 45%,
              rgba(0, 0, 0, 0.75)
            );
        }

        .heroContent {
          position: absolute;
          left: 4.3%;
          top: 140px;
          width: 500px;
          z-index: 5;
        }

        .eyebrow,
        .sectionEyebrow {
          color: var(--gold);
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.3px;
        }

        .eyebrow {
          display: inline-flex;
          border: 1px solid var(--gold);
          border-radius: 30px;
          padding: 8px 15px;
          margin-bottom: 17px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(54px, 5vw, 76px);
          line-height: 0.96;
          letter-spacing: -4px;
          font-weight: 900;
        }

        .hero h1 span {
          color: var(--gold);
        }

        .heroText {
          max-width: 470px;
          margin: 22px 0 19px;
          color: #f0f0eb;
          font-size: 15px;
          line-height: 1.5;
        }

        .heroButtons {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .primaryButton,
        .secondaryButton,
        .smallPrimary,
        .proButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-weight: 700;
        }

        .primaryButton {
          min-height: 48px;
          padding: 0 24px;
          background: linear-gradient(180deg, #ffe46f, #f5c431);
          color: #080808;
        }

        .secondaryButton {
          min-height: 48px;
          padding: 0 22px;
          border: 1px solid var(--gold);
          background: rgba(0, 0, 0, 0.45);
        }

        .playCircle {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--gold);
          color: #111;
          margin-right: 9px;
        }

        .playCircle svg {
          width: 15px;
          height: 15px;
        }

        .heroNote {
          display: flex;
          gap: 9px;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 500;
        }

        .heroNote b {
          color: var(--gold);
        }

        .revenueCard,
        .occupancyCard,
        .propertyCard {
          position: absolute;
          z-index: 6;
          border: 1px solid var(--border);
          background: rgba(8, 9, 9, 0.82);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(10px);
        }

        .revenueCard {
          top: 128px;
          left: 37%;
          width: 235px;
          min-height: 115px;
          padding: 17px;
          border-radius: 14px;
        }

        .smallLabel {
          font-size: 12px;
          color: #ddd;
          margin-bottom: 5px;
        }

        .revenueCard strong {
          display: block;
          font-size: 30px;
          line-height: 1;
          margin-bottom: 10px;
        }

        .growth {
          color: #baff72;
          font-size: 11px;
          font-weight: 600;
        }

        .miniBars {
          position: absolute;
          right: 17px;
          bottom: 17px;
          height: 52px;
          display: flex;
          gap: 4px;
          align-items: flex-end;
        }

        .miniBars i {
          width: 7px;
          display: block;
          background: var(--gold);
          border-radius: 2px 2px 0 0;
        }

        .miniBars i:nth-child(1) {
          height: 18px;
        }

        .miniBars i:nth-child(2) {
          height: 25px;
        }

        .miniBars i:nth-child(3) {
          height: 31px;
        }

        .miniBars i:nth-child(4) {
          height: 38px;
        }

        .miniBars i:nth-child(5) {
          height: 45px;
        }

        .miniBars i:nth-child(6) {
          height: 52px;
        }

        .occupancyCard {
          right: 4%;
          top: 226px;
          width: 255px;
          padding: 17px 20px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .occupancyCard strong {
          display: block;
          font-size: 30px;
          margin: 4px 0 7px;
        }

        .ring {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: conic-gradient(
            var(--gold) 0 92%,
            rgba(255, 255, 255, 0.15) 92% 100%
          );
          position: relative;
        }

        .ring:before {
          content: "";
          position: absolute;
          inset: 9px;
          border-radius: 50%;
          background: #111;
        }

        .ring span {
          position: relative;
          z-index: 2;
          font-weight: 700;
          font-size: 14px;
        }

        .propertyCard {
          right: 14%;
          bottom: 50px;
          width: 360px;
          min-height: 102px;
          padding: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-radius: 15px;
        }

        .propertyCard img {
          width: 91px;
          height: 78px;
          object-fit: cover;
          border-radius: 10px;
        }

        .propertyCard small {
          display: block;
          color: #ddd;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .propertyCard strong {
          display: block;
          font-size: 17px;
        }

        .propertyCard span {
          font-size: 15px;
          display: block;
          margin-top: 2px;
        }

        .featuresSection {
          padding: 0 3%;
          position: relative;
          z-index: 10;
          margin-top: 0;
        }

        .featuresGrid {
          max-width: 1200px;
          margin: -1px auto 0;
          padding: 16px 15px 18px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(8, 9, 9, 0.94);
        }

        .feature {
          text-align: center;
          padding: 0 13px;
          min-width: 0;
        }

        .featureIcon {
          width: 66px;
          height: 66px;
          border-radius: 11px;
          margin: 0 auto 8px;
          display: grid;
          place-items: center;
          color: var(--gold);
          border: 1px solid rgba(255, 255, 255, 0.13);
          background: linear-gradient(145deg, #171919, #090a0a);
        }

        .featureIcon svg {
          width: 34px;
          height: 34px;
        }

        .feature h3 {
          margin: 0 0 6px;
          font-size: 15px;
          letter-spacing: -0.4px;
        }

        .feature p {
          margin: 0;
          color: #ddd;
          font-size: 12px;
          line-height: 1.35;
        }

        .audienceSection {
          max-width: 1200px;
          margin: 14px auto 0;
          padding: 0 0 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .audienceCard {
          min-height: 345px;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(
              circle at 85% 60%,
              rgba(255, 216, 74, 0.11),
              transparent 35%
            ),
            #090a0a;
          display: flex;
        }

        .audienceCopy {
          width: 57%;
          padding: 17px 0 17px 21px;
          position: relative;
          z-index: 5;
        }

        .audienceCopy h2 {
          font-size: 29px;
          line-height: 1;
          letter-spacing: -1.6px;
          margin: 8px 0 12px;
        }

        .audienceCopy ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .audienceCopy li {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 6px 0;
          font-size: 12px;
        }

        .check {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          border-radius: 50%;
          background: #ffdf70;
          color: #171717;
          display: grid;
          place-items: center;
        }

        .check svg {
          width: 15px;
          height: 15px;
        }

        .smallPrimary {
          margin-top: 12px;
          padding: 11px 14px;
          font-size: 11px;
          background: linear-gradient(180deg, #ffe46f, #f5c431);
          color: #090909;
        }

        .phoneArea {
          position: absolute;
          right: -10px;
          bottom: -26px;
          width: 51%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .phoneArea img {
          position: relative;
          z-index: 2;
          width: 255px;
          max-width: none;
          transform: rotate(6deg);
          filter: drop-shadow(0 20px 20px rgba(0, 0, 0, 0.6));
        }

        .tenantPhone img {
          transform: rotate(6deg);
        }

        .phoneGlow {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(255, 216, 74, 0.16);
          filter: blur(55px);
        }

        .proSection {
          max-width: 1200px;
          margin: 15px auto 0;
          min-height: 100px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background:
            linear-gradient(
              90deg,
              rgba(255, 216, 74, 0.08),
              rgba(0, 0, 0, 0.15)
            ),
            #0a0b0b;
          padding: 14px 20px;
          display: grid;
          grid-template-columns: 72px 1fr auto auto;
          align-items: center;
          gap: 16px;
        }

        .crownBox {
          color: var(--gold);
        }

        .crownBox svg {
          width: 58px;
          height: 58px;
        }

        .proText h2 {
          margin: 3px 0 3px;
          font-size: 19px;
        }

        .proText p {
          margin: 0;
          color: #ccc;
          font-size: 11px;
        }

        .proFeatures {
          display: flex;
          gap: 18px;
          color: #eee;
          font-size: 10px;
          white-space: nowrap;
        }

        .proButton {
          min-height: 42px;
          padding: 0 20px;
          background: linear-gradient(180deg, #ffe46f, #f5c431);
          color: #090909;
          font-size: 12px;
          white-space: nowrap;
        }

        .toolsSection,
        .testimonialSection {
          max-width: 1200px;
          margin: 65px auto 0;
        }

        .sectionHeading h2 {
          font-size: 31px;
          margin: 6px 0;
          letter-spacing: -1.4px;
        }

        .sectionHeading p {
          color: #c8c8c2;
          margin: 0;
          font-size: 13px;
        }

        .toolsGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .toolCard {
          min-height: 190px;
          padding: 22px;
          border: 1px solid rgba(255, 216, 74, 0.35);
          border-radius: 14px;
          background: linear-gradient(145deg, #111313, #080909);
        }

        .toolCard > svg {
          color: var(--gold);
          width: 35px;
          height: 35px;
        }

        .toolCard h3 {
          margin: 15px 0 7px;
          font-size: 17px;
        }

        .toolCard p {
          color: #bbb;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        .demoSection {
          max-width: 1200px;
          margin: 65px auto 0;
          min-height: 380px;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background:
            radial-gradient(
              circle at 80% 50%,
              rgba(255, 216, 74, 0.15),
              transparent 35%
            ),
            #090a0a;
        }

        .demoContent {
          padding: 55px;
          display: flex;
          justify-content: center;
          flex-direction: column;
        }

        .demoContent h2 {
          margin: 10px 0 15px;
          font-size: 43px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .demoContent p {
          color: #c9c9c2;
          max-width: 470px;
          line-height: 1.55;
          font-size: 13px;
        }

        .demoContent .primaryButton {
          width: fit-content;
          margin-top: 10px;
        }

        .videoBox {
          margin: 30px;
          border: 1px solid rgba(255, 216, 74, 0.55);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          background:
            linear-gradient(
              rgba(0, 0, 0, 0.4),
              rgba(0, 0, 0, 0.85)
            ),
            url("/unitvero-hero-house.png") center / cover;
        }

        .videoPlay {
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--gold);
          color: #050505;
          margin-bottom: 13px;
          box-shadow: 0 0 45px rgba(255, 216, 74, 0.4);
        }

        .videoPlay svg {
          width: 34px;
          height: 34px;
        }

        .videoBox span {
          font-size: 16px;
          font-weight: 700;
        }

        .videoBox small {
          margin-top: 5px;
          color: #ccc;
          font-size: 11px;
        }

        .testimonialGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .testimonial {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 13px;
          background: #0b0d0d;
          padding: 20px;
          display: grid;
          grid-template-columns: 48px 1fr;
          column-gap: 12px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f3d36c, #8f7c35);
          color: #111;
          display: grid;
          place-items: center;
          font-weight: 800;
        }

        .testimonial strong {
          display: block;
          font-size: 13px;
          margin-top: 5px;
        }

        .testimonial small {
          display: block;
          color: #bbb;
          font-size: 10px;
          margin-top: 2px;
        }

        .testimonial p {
          grid-column: 1 / -1;
          color: #e4e4df;
          line-height: 1.5;
          font-size: 13px;
          margin: 17px 0 10px;
        }

        .stars {
          grid-column: 1 / -1;
          color: var(--gold);
          letter-spacing: 2px;
        }

        .footer {
          max-width: 1280px;
          margin: 65px auto 0;
          border-top: 1px solid rgba(255, 216, 74, 0.38);
          padding: 25px 30px 20px;
          display: grid;
          grid-template-columns: 1.3fr 1fr auto auto;
          align-items: center;
          gap: 30px;
        }

        .footerBrand .logo {
          font-size: 25px;
        }

        .footerBrand p {
          color: #bbb;
          font-size: 11px;
          margin: 5px 0 0;
        }

        .footerLinks {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footerLinks a {
          font-size: 11px;
          color: #ccc;
        }

        .socials {
          display: flex;
          gap: 12px;
        }

        .socials a {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 0;
        }

        .socials a:after {
          font-size: 11px;
          font-weight: 800;
        }

        .socials a:nth-child(1):after {
          content: "IG";
        }

        .socials a:nth-child(2):after {
          content: "in";
        }

        .socials a:nth-child(3):after {
          content: "f";
        }

        .storeButtons {
          display: flex;
          gap: 8px;
        }

        .store {
          min-width: 120px;
          border: 1px solid #aaa;
          border-radius: 7px;
          padding: 7px 11px;
          display: flex;
          flex-direction: column;
        }

        .store small {
          font-size: 7px;
          color: #ccc;
        }

        .store strong {
          font-size: 13px;
        }

        .copyright {
          grid-column: 1 / -1;
          color: #777;
          font-size: 9px;
          padding-top: 8px;
        }

        @media (max-width: 1000px) {
          .topbar {
            padding: 0 25px;
          }

          .nav {
            gap: 20px;
          }

          .heroContent {
            left: 4%;
          }

          .revenueCard {
            left: 47%;
          }

          .propertyCard {
            right: 4%;
          }

          .audienceSection,
          .proSection,
          .toolsSection,
          .testimonialSection,
          .demoSection {
            margin-left: 20px;
            margin-right: 20px;
          }

          .proSection {
            grid-template-columns: 60px 1fr;
          }

          .proFeatures {
            grid-column: 2;
          }

          .proButton {
            grid-column: 2;
            width: fit-content;
          }

          .footer {
            margin-left: 20px;
            margin-right: 20px;
          }
        }

        @media (max-width: 760px) {
          .topbar {
            height: 70px;
            padding: 0 18px;
          }

          .logo {
            font-size: 22px;
          }

          .nav {
            display: none;
          }

          .topActions {
            margin-left: auto;
          }

          .loginButton {
            display: none;
          }

          .getStarted {
            min-width: 120px;
            padding: 0 15px;
          }

          .hero {
            min-height: 820px;
            height: auto;
          }

          .heroContent {
            position: relative;
            top: auto;
            left: auto;
            padding: 125px 22px 40px;
            width: 100%;
          }

          .hero h1 {
            font-size: 54px;
            letter-spacing: -3px;
          }

          .heroText {
            font-size: 14px;
          }

          .heroImage {
            background-position: 68% center;
          }

          .heroOverlay {
            background:
              linear-gradient(
                180deg,
                rgba(5, 6, 6, 0.96) 0%,
                rgba(5, 6, 6, 0.68) 45%,
                rgba(5, 6, 6, 0.9) 100%
              );
          }

          .revenueCard {
            top: auto;
            left: 22px;
            bottom: 190px;
            width: 200px;
          }

          .occupancyCard {
            top: auto;
            right: 22px;
            bottom: 78px;
            width: 215px;
          }

          .propertyCard {
            display: none;
          }

          .featuresGrid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px 5px;
          }

          .audienceSection {
            grid-template-columns: 1fr;
            margin-top: 15px;
          }

          .audienceCard {
            min-height: 400px;
          }

          .audienceCopy {
            width: 58%;
          }

          .phoneArea {
            width: 48%;
          }

          .phoneArea img {
            width: 220px;
          }

          .proSection {
            grid-template-columns: 50px 1fr;
          }

          .proFeatures {
            display: none;
          }

          .proButton {
            grid-column: 2;
          }

          .toolsGrid {
            grid-template-columns: 1fr 1fr;
          }

          .demoSection {
            grid-template-columns: 1fr;
          }

          .demoContent {
            padding: 35px 25px;
          }

          .demoContent h2 {
            font-size: 34px;
          }

          .videoBox {
            min-height: 250px;
          }

          .testimonialGrid {
            grid-template-columns: 1fr;
          }

          .footer {
            grid-template-columns: 1fr;
          }

          .copyright {
            grid-column: 1;
          }
        }

        @media (max-width: 470px) {
          .hero h1 {
            font-size: 47px;
          }

          .heroButtons {
            flex-direction: column;
            align-items: stretch;
          }

          .primaryButton,
          .secondaryButton {
            width: 100%;
          }

          .featuresGrid {
            grid-template-columns: 1fr 1fr;
          }

          .featureIcon {
            width: 55px;
            height: 55px;
          }

          .feature h3 {
            font-size: 12px;
          }

          .feature p {
            font-size: 10px;
          }

          .audienceCard {
            min-height: 430px;
          }

          .audienceCopy {
            width: 64%;
          }

          .audienceCopy h2 {
            font-size: 25px;
          }

          .phoneArea {
            width: 43%;
            right: -30px;
          }

          .phoneArea img {
            width: 190px;
          }

          .toolsGrid {
            grid-template-columns: 1fr;
          }

          .proText h2 {
            font-size: 15px;
          }
        }
      `}</style>
    </main>
  );
}
