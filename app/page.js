"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #030404 !important;
          color: #ffffff !important;
          font-family: Arial, Helvetica, sans-serif !important;
        }

        body {
          overflow-x: hidden;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }

        .uv-home {
          min-height: 100vh;
          background:
            radial-gradient(circle at 75% 8%, rgba(255, 198, 45, .08), transparent 28%),
            linear-gradient(180deg, #050606 0%, #030404 100%);
          color: #fff;
        }

        .uv-container {
          width: min(1500px, calc(100% - 60px));
          margin: 0 auto;
        }

        /* HEADER */

        .uv-header {
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          z-index: 20;
          padding: 0 42px;
        }

        .uv-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -1.2px;
        }

        .uv-logo-mark {
          width: 42px;
          height: 42px;
          border: 5px solid #ffd447;
          border-radius: 9px 9px 12px 12px;
          position: relative;
          transform: rotate(45deg);
        }

        .uv-logo-mark::after {
          content: "";
          position: absolute;
          width: 13px;
          height: 19px;
          left: 10px;
          bottom: 4px;
          border-radius: 2px;
          background: #030404;
        }

        .uv-nav {
          display: flex;
          align-items: center;
          gap: 42px;
          font-size: 15px;
        }

        .uv-nav a {
          color: #f2f2f2;
          transition: .2s ease;
        }

        .uv-nav a:hover {
          color: #ffd447;
        }

        .uv-header-actions {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .uv-login {
          border: 1px solid #d8a900;
          border-radius: 12px;
          padding: 13px 31px;
          background: rgba(0,0,0,.45);
          font-weight: 700;
        }

        .uv-main-button {
          border: 1px solid #ffd447;
          background: linear-gradient(180deg,#ffdb59,#f6bd25);
          color: #050505;
          border-radius: 12px;
          padding: 14px 32px;
          font-weight: 800;
          font-size: 16px;
          box-shadow: 0 8px 28px rgba(255,196,42,.14);
        }

        /* HERO */

        .uv-hero {
          min-height: 730px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          background:
            linear-gradient(90deg,
              rgba(3,4,4,1) 0%,
              rgba(3,4,4,.96) 22%,
              rgba(3,4,4,.60) 48%,
              rgba(3,4,4,.12) 100%),
            url("/unitvero-hero-house.png") center right / cover no-repeat;
        }

        .uv-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,.18),
            transparent 55%,
            #030404 100%
          );
          pointer-events: none;
        }

        .uv-hero-content {
          position: relative;
          z-index: 5;
          width: min(1500px, calc(100% - 60px));
          margin: 0 auto;
          padding-top: 65px;
        }

        .uv-eyebrow {
          display: inline-block;
          border: 1px solid #f3c62e;
          color: #ffd52f;
          border-radius: 30px;
          padding: 8px 17px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .2px;
          margin-bottom: 18px;
        }

        .uv-hero h1 {
          max-width: 570px;
          font-size: clamp(58px, 6vw, 88px);
          line-height: .94;
          letter-spacing: -4px;
          margin: 0;
          font-weight: 900;
        }

        .uv-hero h1 span {
          color: #ffe37b;
        }

        .uv-hero-copy {
          max-width: 580px;
          font-size: 18px;
          line-height: 1.45;
          color: #f1f1f1;
          margin: 28px 0 22px;
        }

        .uv-hero-buttons {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .uv-hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-width: 160px;
          padding: 15px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
        }

        .uv-yellow-button {
          background: #ffd447;
          color: #080808;
        }

        .uv-demo-button {
          border: 1px solid #ffd447;
          color: white;
          background: rgba(0,0,0,.48);
        }

        .uv-play {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffd447;
          color: #111;
          font-size: 11px;
        }

        .uv-small-note {
          margin-top: 12px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
        }

        .uv-small-note span {
          color: #ffd447;
          margin: 0 8px;
        }

        /* FLOATING HERO CARDS */

        .uv-stat {
          position: absolute;
          z-index: 6;
          background: rgba(7,8,7,.88);
          border: 1px solid #dcae1c;
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 15px 45px rgba(0,0,0,.35);
        }

        .uv-stat.revenue {
          top: 130px;
          left: 37%;
          width: 280px;
        }

        .uv-stat.occupancy {
          top: 225px;
          right: 5%;
          width: 300px;
        }

        .uv-stat-property {
          right: 14%;
          bottom: 55px;
          width: 365px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .uv-stat-label {
          font-size: 13px;
          color: #ddd;
        }

        .uv-stat-value {
          font-size: 31px;
          font-weight: 900;
          margin-top: 5px;
        }

        .uv-growth {
          color: #8fe33d;
          font-size: 13px;
          margin-top: 8px;
          font-weight: 700;
        }

        .uv-bars {
          display: flex;
          align-items: end;
          gap: 5px;
          height: 65px;
          position: absolute;
          right: 18px;
          bottom: 18px;
        }

        .uv-bars i {
          width: 7px;
          background: #ffd447;
          border-radius: 4px 4px 0 0;
        }

        .uv-bars i:nth-child(1){height:22px}
        .uv-bars i:nth-child(2){height:31px}
        .uv-bars i:nth-child(3){height:39px}
        .uv-bars i:nth-child(4){height:49px}
        .uv-bars i:nth-child(5){height:59px}

        .uv-property-image {
          width: 90px;
          height: 78px;
          border-radius: 10px;
          object-fit: cover;
        }

        .uv-property-title {
          font-size: 13px;
          color: #ddd;
        }

        .uv-property-address {
          font-size: 20px;
          font-weight: 800;
          margin-top: 5px;
        }

        .uv-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(#ffd447 0deg 331deg, #292929 331deg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }

        .uv-ring::after {
          content: "92%";
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #080908;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
        }

        /* FEATURE STRIP */

        .uv-feature-strip {
          position: relative;
          z-index: 10;
          width: min(1440px, calc(100% - 60px));
          margin: -1px auto 12px;
          border: 1px solid #c89e1c;
          border-radius: 15px;
          background: rgba(8,9,8,.96);
          padding: 22px 25px;
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 18px;
        }

        .uv-feature {
          text-align: center;
        }

        .uv-feature-icon {
          width: 66px;
          height: 66px;
          margin: 0 auto 12px;
          border-radius: 12px;
          border: 1px solid #3b382c;
          background: linear-gradient(145deg,#171813,#090a09);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffd447;
          font-size: 30px;
        }

        .uv-feature h3 {
          font-size: 16px;
          margin: 0 0 7px;
        }

        .uv-feature p {
          color: #ddd;
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
        }

        /* TWO PANELS */

        .uv-two-panels {
          width: min(1440px, calc(100% - 60px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .uv-panel {
          min-height: 390px;
          border: 1px solid #c89e1c;
          border-radius: 15px;
          position: relative;
          overflow: hidden;
          padding: 30px 28px;
          background:
            radial-gradient(circle at 80% 60%,rgba(255,195,39,.10),transparent 35%),
            #080909;
        }

        .uv-panel-label {
          color: #ffd447;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .uv-panel h2 {
          max-width: 360px;
          font-size: 31px;
          line-height: 1;
          margin: 0 0 17px;
        }

        .uv-checklist {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        .uv-checklist li {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
        }

        .uv-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffd447;
          color: #111;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 12px;
          flex: 0 0 auto;
        }

        .uv-panel-button {
          display: inline-block;
          margin-top: 20px;
          background: #ffd447;
          color: #080808;
          padding: 13px 20px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 14px;
        }

        .uv-phone {
          position: absolute;
          right: -10px;
          bottom: -65px;
          width: 280px;
          max-height: 430px;
          object-fit: contain;
          object-position: bottom;
          filter: drop-shadow(0 20px 35px rgba(0,0,0,.7));
        }

        /* PRO */

        .uv-pro {
          width: min(1440px, calc(100% - 60px));
          margin: 15px auto 22px;
          border: 1px solid #c89e1c;
          border-radius: 15px;
          padding: 22px 28px;
          display: flex;
          align-items: center;
          gap: 22px;
          background: linear-gradient(90deg,#0c0d0b,#15130a,#0b0c0b);
        }

        .uv-crown {
          font-size: 58px;
          color: #ffd447;
        }

        .uv-pro-content {
          flex: 1;
        }

        .uv-pro-label {
          color: #ffd447;
          font-size: 13px;
          font-weight: 800;
        }

        .uv-pro h2 {
          margin: 4px 0;
          font-size: 22px;
        }

        .uv-pro p {
          margin: 0;
          font-size: 12px;
          color: #ddd;
        }

        .uv-pro-features {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #eee;
        }

        /* TESTIMONIALS */

        .uv-testimonials {
          width: min(1440px, calc(100% - 60px));
          margin: 0 auto 20px;
        }

        .uv-testimonials h2 {
          font-size: 25px;
          margin: 0 0 3px;
        }

        .uv-testimonials-sub {
          color: #ddd;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .uv-testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 15px;
        }

        .uv-testimonial {
          border: 1px solid #282a27;
          background: #0a0b0a;
          border-radius: 13px;
          padding: 21px;
        }

        .uv-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .uv-avatar {
          width: 53px;
          height: 53px;
          border-radius: 50%;
          background: linear-gradient(135deg,#eee,#aaa);
          border: 2px solid #fff;
        }

        .uv-user-name {
          font-weight: 800;
          font-size: 14px;
        }

        .uv-user-role {
          color: #ccc;
          font-size: 12px;
          margin-top: 3px;
        }

        .uv-quote {
          color: #f1f1f1;
          font-size: 14px;
          line-height: 1.45;
          margin: 17px 0;
        }

        .uv-stars {
          color: #ffd447;
          letter-spacing: 3px;
          font-size: 18px;
        }

        /* FOOTER */

        .uv-footer {
          border-top: 1px solid #4d3d12;
          margin-top: 25px;
          padding: 25px 0;
        }

        .uv-footer-inner {
          width: min(1440px, calc(100% - 60px));
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .uv-footer-logo {
          font-size: 27px;
          font-weight: 900;
        }

        .uv-footer-tag {
          color: #ddd;
          font-size: 12px;
          margin-top: 5px;
        }

        .uv-footer-links {
          display: flex;
          gap: 28px;
          font-size: 12px;
        }

        .uv-socials {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 22px;
          font-weight: 900;
        }

        .uv-socials a:hover {
          color: #ffd447;
        }

        .uv-store-buttons {
          display: flex;
          gap: 10px;
        }

        .uv-store {
          border: 1px solid #aaa;
          border-radius: 8px;
          padding: 9px 13px;
          min-width: 120px;
          font-size: 11px;
          text-align: center;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .uv-nav {
            gap: 18px;
          }

          .uv-stat.revenue {
            left: 45%;
          }

          .uv-stat.occupancy {
            right: 2%;
          }

          .uv-stat-property {
            right: 5%;
          }

          .uv-feature-strip {
            grid-template-columns: repeat(3,1fr);
          }

          .uv-phone {
            width: 220px;
          }

          .uv-pro-features {
            display: none;
          }

          .uv-footer-inner {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 800px) {
          .uv-header {
            padding: 0 20px;
          }

          .uv-nav {
            display: none;
          }

          .uv-hero {
            min-height: 850px;
            background-position: 62% center;
          }

          .uv-hero-content {
            width: calc(100% - 40px);
            padding-top: 100px;
          }

          .uv-hero h1 {
            font-size: 52px;
            letter-spacing: -2.5px;
          }

          .uv-hero-copy {
            font-size: 16px;
          }

          .uv-stat {
            transform: scale(.78);
            transform-origin: center;
          }

          .uv-stat.revenue {
            left: 40%;
            top: 420px;
          }

          .uv-stat.occupancy {
            top: 535px;
            right: -25px;
          }

          .uv-stat-property {
            bottom: 35px;
            right: 10px;
            transform: scale(.78);
          }

          .uv-feature-strip,
          .uv-two-panels,
          .uv-testimonial-grid {
            width: calc(100% - 30px);
          }

          .uv-feature-strip {
            grid-template-columns: repeat(2,1fr);
          }

          .uv-two-panels {
            grid-template-columns: 1fr;
          }

          .uv-panel {
            min-height: 420px;
          }

          .uv-pro {
            width: calc(100% - 30px);
          }

          .uv-testimonial-grid {
            grid-template-columns: 1fr;
          }

          .uv-footer-links {
            display: none;
          }
        }
      `}</style>

      <main className="uv-home">

        {/* HEADER */}
        <header className="uv-header">
          <Link href="/" className="uv-logo">
            <span className="uv-logo-mark"></span>
            <span>Unitvero</span>
          </Link>

          <nav className="uv-nav">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#resources">Resources</Link>
            <Link href="#about">About</Link>
          </nav>

          <div className="uv-header-actions">
            <Link href="/login" className="uv-login">
              Log In
            </Link>

            <Link href="/login" className="uv-main-button">
              Get Started
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="uv-hero">
          <div className="uv-hero-content">
            <div className="uv-eyebrow">
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

            <p className="uv-hero-copy">
              Everything landlords and tenants need in one modern platform.
              Manage properties, collect rent, handle maintenance, track
              finances, and stay connected — all in one place.
            </p>

            <div className="uv-hero-buttons">
              <Link href="/login" className="uv-hero-button uv-yellow-button">
                Get Started
                <span>→</span>
              </Link>

              <a href="#demo" className="uv-hero-button uv-demo-button">
                <span className="uv-play">▶</span>
                Watch Demo
              </a>
            </div>

            <div className="uv-small-note">
              1 Month of Pro Free
              <span>•</span>
              No Credit Card Required
            </div>
          </div>

          <div className="uv-stat revenue">
            <div className="uv-stat-label">Monthly Revenue</div>
            <div className="uv-stat-value">$48,750</div>
            <div className="uv-growth">↑ 12% from last month</div>

            <div className="uv-bars">
              <i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>

          <div className="uv-stat occupancy">
            <div className="uv-stat-label">Occupancy Rate</div>
            <div className="uv-stat-value">92%</div>
            <div className="uv-growth">↑ 4% from last month</div>

            <div className="uv-ring"></div>
          </div>

          <div className="uv-stat uv-stat-property">
            <img
              src="/unitvero-hero-house.png"
              className="uv-property-image"
              alt="Property"
            />

            <div>
              <div className="uv-property-title">Property Managed</div>
              <div className="uv-property-address">
                1234 Maple St.
                <br />
                Unit 2A
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="uv-feature-strip">

          <div className="uv-feature">
            <div className="uv-feature-icon">$</div>
            <h3>Rent Collection</h3>
            <p>Get paid on time, every time.</p>
          </div>

          <div className="uv-feature">
            <div className="uv-feature-icon">⚒</div>
            <h3>Maintenance</h3>
            <p>Submit & track requests easily.</p>
          </div>

          <div className="uv-feature">
            <div className="uv-feature-icon">⌕</div>
            <h3>Tenant Screening</h3>
            <p>Find reliable tenants.</p>
          </div>

          <div className="uv-feature">
            <div className="uv-feature-icon">▱</div>
            <h3>Lease Management</h3>
            <p>Create, sign, and store leases.</p>
          </div>

          <div className="uv-feature">
            <div className="uv-feature-icon">▥</div>
            <h3>Financial Reports</h3>
            <p>Track income, expenses, and profit.</p>
          </div>

          <div className="uv-feature">
            <div className="uv-feature-icon">▢</div>
            <h3>Secure Messaging</h3>
            <p>Stay connected in one place.</p>
          </div>

        </section>

        {/* LANDLORD / TENANT */}
        <section className="uv-two-panels">

          <div className="uv-panel">
            <div className="uv-panel-label">FOR LANDLORDS</div>

            <h2>
              More Control.
              <br />
              Less Work.
            </h2>

            <ul className="uv-checklist">
              <li><span className="uv-check">✓</span>Track rent & expenses</li>
              <li><span className="uv-check">✓</span>Manage properties</li>
              <li><span className="uv-check">✓</span>Screen tenants</li>
              <li><span className="uv-check">✓</span>Handle maintenance</li>
              <li><span className="uv-check">✓</span>Generate reports</li>
              <li><span className="uv-check">✓</span>Use on web & mobile</li>
            </ul>

            <Link href="/login" className="uv-panel-button">
              Get Started as a Landlord →
            </Link>

            <img
              src="/unitvero-landlord-phone.png"
              className="uv-phone"
              alt="Unitvero landlord app"
            />
          </div>

          <div className="uv-panel">
            <div className="uv-panel-label">FOR TENANTS</div>

            <h2>
              A Better Renting
              <br />
              Experience.
            </h2>

            <ul className="uv-checklist">
              <li><span className="uv-check">✓</span>Pay rent online</li>
              <li><span className="uv-check">✓</span>Submit maintenance requests</li>
              <li><span className="uv-check">✓</span>Access documents</li>
              <li><span className="uv-check">✓</span>Receive notifications</li>
              <li><span className="uv-check">✓</span>Communicate with your landlord</li>
              <li><span className="uv-check">✓</span>Stay organized</li>
            </ul>

            <Link href="/login" className="uv-panel-button">
              Get Started as a Tenant →
            </Link>

            <img
              src="/unitvero-tenant-phone.png"
              className="uv-phone"
              alt="Unitvero tenant app"
            />
          </div>

        </section>

        {/* PRO */}
        <section id="pricing" className="uv-pro">
          <div className="uv-crown">♛</div>

          <div className="uv-pro-content">
            <div className="uv-pro-label">UNITVERO PRO</div>

            <h2>Try Unitvero Pro Free for 1 Month</h2>

            <p>
              Unlock advanced features and take your property management to
              the next level.
            </p>
          </div>

          <div className="uv-pro-features">
            <span>▥ Advanced Reports</span>
            <span>◉ Priority Support</span>
            <span>♙ Unlimited Properties</span>
            <span>◇ Custom Branding</span>
          </div>

          <Link href="/login" className="uv-main-button">
            Get 1 Month Free →
          </Link>
        </section>

        {/* TESTIMONIALS */}
        <section id="about" className="uv-testimonials">
          <h2>Trusted by Landlords and Tenants</h2>

          <div className="uv-testimonials-sub">
            See what our users are saying about Unitvero.
          </div>

          <div className="uv-testimonial-grid">

            <div className="uv-testimonial">
              <div className="uv-user">
                <div className="uv-avatar"></div>
                <div>
                  <div className="uv-user-name">Landon R.</div>
                  <div className="uv-user-role">Property Owner</div>
                </div>
              </div>

              <div className="uv-quote">
                “Unitvero has made managing my properties so much easier.
                Everything I need is in one place.”
              </div>

              <div className="uv-stars">★★★★★</div>
            </div>

            <div className="uv-testimonial">
              <div className="uv-user">
                <div className="uv-avatar"></div>
                <div>
                  <div className="uv-user-name">Tyesha M.</div>
                  <div className="uv-user-role">Tenant</div>
                </div>
              </div>

              <div className="uv-quote">
                “I love how easy it is to pay rent and submit maintenance
                requests! Great app!”
              </div>

              <div className="uv-stars">★★★★★</div>
            </div>

            <div className="uv-testimonial">
              <div className="uv-user">
                <div className="uv-avatar"></div>
                <div>
                  <div className="uv-user-name">Marcus T.</div>
                  <div className="uv-user-role">Real Estate Investor</div>
                </div>
              </div>

              <div className="uv-quote">
                “Clean, modern, and powerful. Exactly what I needed to manage
                my portfolio.”
              </div>

              <div className="uv-stars">★★★★★</div>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="uv-footer">
          <div className="uv-footer-inner">

            <div>
              <div className="uv-footer-logo">⌂ Unitvero</div>
              <div className="uv-footer-tag">
                Manage Today. Build Tomorrow.
              </div>
            </div>

            <div className="uv-footer-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#resources">Resources</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="uv-socials">
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Facebook">f</a>
            </div>

            <div className="uv-store-buttons">
              <div className="uv-store">
                <br />
                Download on the App Store
              </div>

              <div className="uv-store">
                ▶<br />
                GET IT ON Google Play
              </div>
            </div>

          </div>
        </footer>

      </main>
    </>
  );
}
