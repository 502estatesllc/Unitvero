"use client";

import Link from "next/link";
import { useState } from "react";

const features = [
  ["▣", "Rent Collection", "Get paid on time, every time."],
  ["⚒", "Maintenance", "Submit & track requests easily."],
  ["⌕", "Tenant Screening", "Find reliable tenants."],
  ["▤", "Lease Management", "Create, sign, and store leases."],
  ["▥", "Financial Reports", "Track income, expenses, and profit."],
  ["▱", "Secure Messaging", "Stay connected in one place."],
];

const landlordItems = [
  "Track rent & expenses",
  "Manage properties",
  "Screen tenants",
  "Handle maintenance",
  "Generate reports",
  "Create custom landlord documents",
  "Send letters, leases & notices",
  "Send alerts to all tenants",
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

      {/* NAV */}
      <header className="nav">
        <Link href="/" className="logo">
          <span className="logoIcon">⌂</span>
          <span>Unitvero</span>
        </Link>

        <nav>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
        </nav>

        <div className="navActions">
          <Link href="/login" className="login">
            Log In
          </Link>

          <Link href="/signup" className="start">
            Get Started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">

        <img
          className="heroHouse"
          src="/unitvero-hero-house.png"
          alt="Modern luxury home"
        />

        <div className="heroShade" />

        <div className="heroContent">

          <div className="heroText">
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

            <p>
              Everything landlords and tenants need in one modern platform.
              Manage properties, collect rent, handle maintenance, track
              finances, and stay connected — all in one place.
            </p>

            <div className="heroButtons">
              <Link href="/signup" className="goldButton">
                Get Started <b>→</b>
              </Link>

              <button
                className="demoButton"
                onClick={() => setDemo(true)}
              >
                <span>▶</span>
                Watch Demo
              </button>
            </div>

            <div className="finePrint">
              <span>1 Month of Pro Free</span>
              <b>•</b>
              <span>No Credit Card Required</span>
            </div>
          </div>

          {/* HERO CARDS */}
          <div className="heroVisual">

            <div className="revenue card">
              <small>Monthly Revenue</small>
              <strong>$48,750</strong>
              <em>↑ 12% from last month</em>

              <div className="bars">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="occupancy card">
              <small>Occupancy Rate</small>
              <strong>92%</strong>
              <em>↑ 4% from last month</em>

              <div className="donut">
                <span>92%</span>
              </div>
            </div>

            <div className="propertyPreview">
              <img
                src="/unitvero-hero-house.png"
                alt=""
              />

              <div>
                <small>Property Managed</small>
                <strong>1234 Maple St.</strong>
                <span>Unit 2A</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        {features.map(([icon, title, text]) => (
          <div className="feature" key={title}>
            <div className="featureIcon">{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      {/* LANDLORD / TENANT */}
      <section className="audience">

        <div className="audienceCard">
          <div className="audienceText">
            <div className="sectionLabel">FOR LANDLORDS</div>

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

            <Link href="/signup" className="goldButton small">
              Get Started as a Landlord →
            </Link>
          </div>

          <div className="phone">
            <img
              src="/unitvero-landlord-phone.png"
              alt="Unitvero landlord app"
            />
          </div>
        </div>

        <div className="audienceCard">
          <div className="audienceText">
            <div className="sectionLabel">FOR TENANTS</div>

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

            <Link href="/signup" className="goldButton small">
              Get Started as a Tenant →
            </Link>
          </div>

          <div className="phone">
            <img
              src="/unitvero-tenant-phone.png"
              alt="Unitvero tenant app"
            />
          </div>
        </div>

      </section>

      {/* PRO */}
      <section id="pricing" className="pro">
        <div className="crown">♛</div>

        <div>
          <div className="sectionLabel">UNITVERO PRO</div>
          <h2>Try Unitvero Pro Free for 1 Month</h2>
          <p>
            Unlock advanced features and take your property management
            to the next level.
          </p>
        </div>

        <div className="benefits">
          <span>▥ Advanced Reports</span>
          <span>◉ Priority Support</span>
          <span>♙ Unlimited Properties</span>
          <span>⌕ Custom Branding</span>
        </div>

        <Link href="/signup" className="proButton">
          Get 1 Month Free →
        </Link>
      </section>

      {/* TESTIMONIALS */}
      <section id="resources" className="testimonials">
        <div className="sectionTitle">
          <h2>Trusted by Landlords and Tenants</h2>
          <p>See what our users are saying about Unitvero.</p>
        </div>

        <div className="testimonialGrid">

          <div className="testimonial">
            <div className="person">
              <div className="avatar">L</div>
              <div>
                <strong>Landon R.</strong>
                <span>Property Owner</span>
              </div>
            </div>

            <p>
              “Unitvero has made managing my properties so much easier.
              Everything I need is in one place.”
            </p>

            <div className="stars">★★★★★</div>
          </div>

          <div className="testimonial">
            <div className="person">
              <div className="avatar">T</div>
              <div>
                <strong>Tyesha M.</strong>
                <span>Tenant</span>
              </div>
            </div>

            <p>
              “I love how easy it is to pay rent and submit maintenance
              requests! Great app!”
            </p>

            <div className="stars">★★★★★</div>
          </div>

          <div className="testimonial">
            <div className="person">
              <div className="avatar">M</div>
              <div>
                <strong>Marcus T.</strong>
                <span>Real Estate Investor</span>
              </div>
            </div>

            <p>
              “Clean, modern, and powerful. Exactly what I needed to
              manage my portfolio.”
            </p>

            <div className="stars">★★★★★</div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer id="about">
        <div className="footerBrand">
          <Link href="/" className="logo">
            <span className="logoIcon">⌂</span>
            <span>Unitvero</span>
          </Link>
          <p>Manage Today. Build Tomorrow.</p>
        </div>

        <div className="footerLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <Link href="/login">Contact</Link>
        </div>

        <div className="socials">
          <span>◎</span>
          <span>in</span>
          <span>f</span>
        </div>

        <div className="stores">
          <div> <b>App Store</b></div>
          <div>▶ <b>Google Play</b></div>
        </div>
      </footer>

      {/* DEMO */}
      {demo && (
        <div className="modal">
          <div className="modalBox">
            <button
              className="close"
              onClick={() => setDemo(false)}
            >
              ×
            </button>

            <div className="sectionLabel">UNITVERO DEMO</div>

            <h2>See Unitvero in action.</h2>

            <p>
              See rent collection, properties, tenants, maintenance,
              documents, messaging, landlord tools and the tenant portal.
            </p>

            <div className="video">
              <video controls playsInline>
                <source
                  src="/unitvero-demo.mp4"
                  type="video/mp4"
                />
              </video>

              <div>
                <span className="play">▶</span>
                <strong>Unitvero Feature Demo</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #050606;
          color: white;
          font-family: Arial, Helvetica, sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          font-family: inherit;
        }

        .uv {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(244,200,79,.08),
              transparent 35%
            ),
            #050606;
        }

        /* NAV */

        .nav {
          width: calc(100% - 60px);
          max-width: 1450px;
          height: 84px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 20;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .logoIcon {
          width: 35px;
          height: 35px;
          border: 2px solid #f4c84f;
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: #f4c84f;
          font-size: 22px;
        }

        .nav nav {
          display: flex;
          gap: 48px;
          margin-left: auto;
          margin-right: 40px;
        }

        .nav nav a {
          color: #eee;
          font-size: 14px;
        }

        .nav nav a:hover {
          color: #f4c84f;
        }

        .navActions {
          display: flex;
          gap: 18px;
        }

        .login,
        .start {
          height: 48px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
        }

        .login {
          border: 1px solid #f4c84f;
          background: rgba(0,0,0,.55);
        }

        .start {
          min-width: 165px;
          background: linear-gradient(
            135deg,
            #ffe078,
            #f4c84f
          );
          color: #111;
        }

        /* HERO */

        .hero {
          width: calc(100% - 60px);
          max-width: 1450px;
          min-height: 600px;
          margin: 0 auto;
          border-radius: 0 0 16px 16px;
          position: relative;
          overflow: hidden;
        }

        .heroHouse {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }

        .heroShade {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,.95) 0%,
              rgba(0,0,0,.82) 28%,
              rgba(0,0,0,.38) 60%,
              rgba(0,0,0,.18) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0,0,0,.12),
              rgba(0,0,0,.45)
            );
        }

        .heroContent {
          min-height: 600px;
          padding: 45px;
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 48% 52%;
          align-items: center;
        }

        .heroText {
          max-width: 620px;
        }

        .eyebrow,
        .sectionLabel {
          color: #f4c84f;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .eyebrow {
          width: fit-content;
          padding: 7px 16px;
          border: 1px solid #f4c84f;
          border-radius: 999px;
        }

        .hero h1 {
          margin: 17px 0 20px;
          font-size: clamp(54px,5.2vw,86px);
          line-height: .92;
          letter-spacing: -5px;
          font-weight: 900;
        }

        .hero h1 span {
          color: #f4c84f;
        }

        .heroText > p {
          max-width: 600px;
          margin: 0;
          font-size: 16px;
          line-height: 1.55;
          color: #f1f1ee;
        }

        .heroButtons {
          display: flex;
          gap: 14px;
          margin-top: 27px;
        }

        .goldButton {
          min-height: 49px;
          padding: 0 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border-radius: 10px;
          border: 1px solid #ffe078;
          background: linear-gradient(
            135deg,
            #ffe078,
            #f4c84f
          );
          color: #111;
          font-size: 14px;
          font-weight: 900;
        }

        .goldButton b {
          font-size: 20px;
        }

        .demoButton {
          min-height: 49px;
          padding: 0 21px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid #f4c84f;
          border-radius: 10px;
          background: rgba(0,0,0,.5);
          color: white;
          cursor: pointer;
          font-weight: 800;
        }

        .demoButton span {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f4c84f;
          color: #111;
          font-size: 11px;
        }

        .finePrint {
          margin-top: 13px;
          display: flex;
          gap: 9px;
          font-size: 11px;
        }

        .finePrint b {
          color: #f4c84f;
        }

        /* HERO VISUAL */

        .heroVisual {
          height: 510px;
          position: relative;
        }

        .card {
          position: absolute;
          padding: 20px;
          border: 1px solid #f4c84f;
          border-radius: 15px;
          background: rgba(10,11,10,.84);
          backdrop-filter: blur(9px);
          box-shadow: 0 20px 50px rgba(0,0,0,.4);
        }

        .card small {
          display: block;
          color: #eee;
          font-size: 12px;
        }

        .card strong {
          display: block;
          margin-top: 5px;
          font-size: 30px;
        }

        .card em {
          display: block;
          margin-top: 7px;
          color: #c7ff75;
          font-size: 11px;
          font-weight: 800;
          font-style: normal;
        }

        .revenue {
          top: 65px;
          left: 0;
          width: 275px;
          height: 125px;
        }

        .bars {
          position: absolute;
          right: 18px;
          bottom: 18px;
          height: 60px;
          display: flex;
          align-items: flex-end;
          gap: 5px;
        }

        .bars i {
          width: 9px;
          display: block;
          border-radius: 2px 2px 0 0;
          background: linear-gradient(
            #ffe17d,
            #d9a92f
          );
        }

        .bars i:nth-child(1){height:20px}
        .bars i:nth-child(2){height:28px}
        .bars i:nth-child(3){height:38px}
        .bars i:nth-child(4){height:30px}
        .bars i:nth-child(5){height:49px}
        .bars i:nth-child(6){height:60px}

        .occupancy {
          top: 155px;
          right: 0;
          width: 300px;
          height: 135px;
        }

        .donut {
          position: absolute;
          right: 18px;
          top: 24px;
          width: 75px;
          height: 75px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(
              circle,
              #101212 53%,
              transparent 54%
            ),
            conic-gradient(
              #f4c84f 0 92%,
              rgba(255,255,255,.22) 92% 100%
            );
        }

        .donut span {
          font-size: 13px;
          font-weight: 900;
        }

        .propertyPreview {
          position: absolute;
          right: 70px;
          bottom: 25px;
          width: 365px;
          min-height: 105px;
          padding: 11px;
          display: flex;
          align-items: center;
          gap: 15px;
          border: 1px solid #f4c84f;
          border-radius: 14px;
          background: rgba(8,9,8,.88);
          backdrop-filter: blur(8px);
        }

        .propertyPreview img {
          width: 92px;
          height: 82px;
          object-fit: cover;
          border-radius: 10px;
        }

        .propertyPreview div {
          display: grid;
          gap: 4px;
        }

        .propertyPreview small {
          color: #ddd;
          font-size: 11px;
        }

        .propertyPreview strong {
          font-size: 17px;
        }

        .propertyPreview span {
          font-size: 14px;
        }

        /* FEATURES */

        .features {
          width: calc(100% - 60px);
          max-width: 1450px;
          margin: 0 auto;
          padding: 17px 25px;
          display: grid;
          grid-template-columns: repeat(6,1fr);
          border: 1px solid #f4c84f;
          border-radius: 0 0 14px 14px;
          background: #0c0e0e;
        }

        .feature {
          min-height: 125px;
          padding: 0 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border-right: 1px solid rgba(244,200,79,.12);
        }

        .feature:last-child {
          border: 0;
        }

        .featureIcon {
          width: 54px;
          height: 54px;
          margin-bottom: 10px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(244,200,79,.35);
          border-radius: 10px;
          color: #f4c84f;
          font-size: 27px;
        }

        .feature h3 {
          margin: 0;
          font-size: 15px;
        }

        .feature p {
          max-width: 160px;
          margin: 6px 0 0;
          color: #aaa;
          font-size: 11px;
          line-height: 1.45;
        }

        /* AUDIENCE */

        .audience {
          width: calc(100% - 60px);
          max-width: 1450px;
          margin: 16px auto 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .audienceCard {
          min-height: 405px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 260px;
          border: 1px solid #f4c84f;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            #0b0d0d,
            #151716
          );
        }

        .audienceText {
          padding: 24px;
        }

        .audienceText h2 {
          margin: 8px 0 15px;
          font-size: 42px;
          line-height: .98;
          letter-spacing: -2px;
        }

        .audienceText ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
          display: grid;
          gap: 7px;
        }

        .audienceText li {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
        }

        .audienceText li span {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f4c84f;
          color: #111;
          font-weight: 900;
        }

        .goldButton.small {
          min-height: 43px;
          padding: 0 15px;
          font-size: 11px;
        }

        .phone {
          min-height: 405px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
        }

        .phone img {
          width: 245px;
          max-width: none;
          height: auto;
          display: block;
          filter: drop-shadow(
            0 22px 28px rgba(0,0,0,.55)
          );
        }

        .audienceCard:first-child .phone img {
          transform: rotate(5deg) translateY(12px);
        }

        .audienceCard:last-child .phone img {
          transform: rotate(-5deg) translateY(12px);
        }

        /* PRO */

        .pro {
          width: calc(100% - 60px);
          max-width: 1450px;
          min-height: 118px;
          margin: 16px auto 0;
          padding: 18px 25px;
          display: grid;
          grid-template-columns: 75px 1fr auto auto;
          align-items: center;
          gap: 20px;
          border: 1px solid #f4c84f;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            #171506,
            #0b0d0d
          );
        }

        .crown {
          color: #f4c84f;
          font-size: 54px;
          text-align: center;
        }

        .pro h2 {
          margin: 4px 0;
          font-size: 23px;
        }

        .pro p {
          margin: 0;
          color: #aaa;
          font-size: 10px;
        }

        .benefits {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        .benefits span {
          color: #ccc;
          font-size: 10px;
          white-space: nowrap;
        }

        .proButton {
          min-height: 45px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: linear-gradient(
            135deg,
            #ffe078,
            #f4c84f
          );
          color: #111;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        /* TESTIMONIALS */

        .testimonials {
          width: calc(100% - 60px);
          max-width: 1450px;
          margin: 26px auto 0;
          padding-bottom: 22px;
        }

        .sectionTitle h2 {
          margin: 0;
          font-size: 26px;
        }

        .sectionTitle p {
          margin: 4px 0 13px;
          color: #999;
          font-size: 11px;
        }

        .testimonialGrid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
        }

        .testimonial {
          min-height: 170px;
          padding: 18px;
          border: 1px solid rgba(244,200,79,.22);
          border-radius: 12px;
          background: #101212;
        }

        .person {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar {
          width: 43px;
          height: 43px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e8dfc7;
          color: #222;
          font-weight: 900;
        }

        .person div:last-child {
          display: grid;
          gap: 2px;
        }

        .person span {
          color: #999;
          font-size: 10px;
        }

        .testimonial p {
          margin: 15px 0 11px;
          font-size: 12px;
          line-height: 1.55;
        }

        .stars {
          color: #f4c84f;
          letter-spacing: 2px;
        }

        /* FOOTER */

        footer {
          width: calc(100% - 60px);
          max-width: 1450px;
          min-height: 110px;
          margin: auto;
          padding: 22px 0;
          display: grid;
          grid-template-columns: 1.15fr 1fr auto auto;
          align-items: center;
          gap: 30px;
          border-top: 1px solid rgba(244,200,79,.25);
        }

        .footerBrand p {
          margin: 5px 0 0;
          color: #999;
          font-size: 10px;
        }

        .footerLinks {
          display: flex;
          justify-content: center;
          gap: 22px;
        }

        .footerLinks a {
          color: #bbb;
          font-size: 10px;
        }

        .socials {
          display: flex;
          gap: 17px;
          font-weight: 900;
        }

        .stores {
          display: flex;
          gap: 8px;
        }

        .stores div {
          min-width: 125px;
          min-height: 43px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #888;
          border-radius: 8px;
          font-size: 12px;
        }

        /* MODAL */

        .modal {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 20px;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,.9);
        }

        .modalBox {
          position: relative;
          width: min(1000px,100%);
          padding: 30px;
          border: 1px solid #f4c84f;
          border-radius: 17px;
          background: #090b0b;
        }

        .close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #f4c84f;
          background: #111;
          color: #f4c84f;
          font-size: 28px;
          cursor: pointer;
        }

        .modalBox h2 {
          margin: 7px 0;
          font-size: 32px;
        }

        .modalBox > p {
          color: #999;
          font-size: 12px;
        }

        .video {
          height: 430px;
          margin-top: 20px;
          background: #020303;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .video video {
          width: 100%;
          height: 100%;
        }

        .video > div {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .play {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f4c84f;
          color: #111;
          font-size: 20px;
        }

        /* RESPONSIVE */

        @media(max-width:1100px) {

          .nav nav {
            gap: 20px;
            margin-right: 10px;
          }

          .heroContent {
            grid-template-columns: 1fr;
          }

          .heroVisual {
            margin-top: 20px;
          }

          .audience {
            grid-template-columns: 1fr;
          }

          .pro {
            grid-template-columns: 65px 1fr;
          }

          .benefits,
          .proButton {
            grid-column: 2;
            justify-content: flex-start;
          }

          footer {
            grid-template-columns: 1fr 1fr;
          }

        }

        @media(max-width:800px) {

          .nav {
            width: calc(100% - 30px);
          }

          .nav nav {
            display: none;
          }

          .hero,
          .features,
          .audience,
          .pro,
          .testimonials,
          footer {
            width: calc(100% - 30px);
          }

          .heroContent {
            padding: 30px 20px;
          }

          .hero h1 {
            font-size: 55px;
            letter-spacing: -3px;
          }

          .features {
            grid-template-columns: repeat(3,1fr);
          }

          .testimonialGrid {
            grid-template-columns: 1fr;
          }

        }

        @media(max-width:600px) {

          .login {
            display: none;
          }

          .start {
            min-width: 115px;
            padding: 0 14px;
          }

          .heroVisual {
            height: 400px;
          }

          .revenue {
            width: 205px;
          }

          .occupancy {
            width: 220px;
            top: 90px;
          }

          .propertyPreview {
            right: 10px;
            bottom: 10px;
            width: calc(100% - 20px);
          }

          .features {
            grid-template-columns: repeat(2,1fr);
          }

          .audienceCard {
            grid-template-columns: 1fr;
          }

          .phone {
            min-height: 310px;
          }

          .phone img {
            width: 215px;
          }

          .pro {
            grid-template-columns: 50px 1fr;
          }

          .benefits,
          .proButton {
            grid-column: 1 / -1;
          }

          .proButton {
            width: 100%;
          }

          footer {
            grid-template-columns: 1fr;
          }

          .footerLinks {
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .stores {
            flex-wrap: wrap;
          }

        }

      `}</style>

    </main>
  );
}
