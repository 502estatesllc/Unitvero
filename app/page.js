"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <main className="site">
      <nav className="navbar">
        <a href="#" className="logo">
          unit<span>vero</span>
        </a>

        <div className={`navLinks ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#landlords" onClick={() => setMenuOpen(false)}>
            For landlords
          </a>
          <a href="#tenants" onClick={() => setMenuOpen(false)}>
            For tenants
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </div>

        <div className="navActions">
          <button className="loginButton">Log in</button>
          <button className="primaryButton small">Get started</button>
        </div>

        <button
          className="menuButton"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <section className="hero">
        <div className="heroContent">
          <div className="eyebrow">
            <span className="eyebrowDot" />
            Property management, simplified
          </div>

          <h1>
            Everything your
            <br />
            property needs,
            <br />
            <em>in one place.</em>
          </h1>

          <p className="heroText">
            Unitvero helps landlords and tenants manage properties, payments,
            maintenance, and communication without the usual complexity.
          </p>

          <div className="heroButtons">
            <button className="primaryButton">Start for free</button>

            <button
              className="watchButton"
              onClick={() => setShowVideo(true)}
            >
              <span className="playIcon">▶</span>
              Watch the demo
            </button>
          </div>

          <div className="heroTrust">
            <div className="avatarStack">
              <span>JM</span>
              <span>AK</span>
              <span>LS</span>
              <span>+</span>
            </div>

            <div>
              <strong>Trusted by 2,000+ property owners</strong>
              <small>Join the smarter way to manage property</small>
            </div>
          </div>
        </div>

        <div className="heroVisual">
          <div className="glow" />

          <div className="heroImageFrame">
            <img
              src="/unitvero-hero-house.jpg"
              alt="Modern property"
              className="heroImage"
            />
          </div>

          <div className="floatingCard incomeCard">
            <div className="cardLabel">Monthly income</div>
            <div className="incomeValue">$24,680</div>
            <div className="incomeChange">↗ 12.8%</div>

            <div className="miniChart">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="floatingCard paymentCard">
            <div className="checkCircle">✓</div>

            <div>
              <strong>Payment received</strong>
              <small>Apartment 204 · Today</small>
            </div>
          </div>

          <div className="floatingCard ratingCard">
            <span>★★★★★</span>
            <strong>4.9</strong>
            <small>Tenant rating</small>
          </div>
        </div>
      </section>

      <section className="logoStrip">
        <span>Built for modern property teams</span>

        <div className="logoItems">
          <b>haven</b>
          <b>nestly</b>
          <b>
            estate<span>co</span>
          </b>
          <b>OAK &amp; STONE</b>
          <b>roam</b>
        </div>
      </section>

      <section className="section featuresSection" id="features">
        <div className="sectionHeading centered">
          <div className="eyebrow">
            <span className="eyebrowDot" />
            One powerful platform
          </div>

          <h2>
            Less admin.
            <br />
            <em>More living.</em>
          </h2>

          <p>
            Everything you need to run your properties smoothly, beautifully,
            and profitably.
          </p>
        </div>

        <div className="featureGrid">
          <FeatureCard
            icon="▣"
            title="Property management"
            text="Keep every property, unit, lease, and document organized in one clear dashboard."
            large
          />

          <FeatureCard
            icon="$"
            title="Simple payments"
            text="Collect rent on time with effortless digital payments and automatic reminders."
          />

          <FeatureCard
            icon="⌁"
            title="Easy maintenance"
            text="Resolve issues faster with streamlined maintenance requests."
          />

          <FeatureCard
            icon="◌"
            title="Clear communication"
            text="Keep every conversation in one place, available whenever you need it."
          />

          <FeatureCard
            icon="↗"
            title="Smart insights"
            text="Understand your portfolio with reports that make decisions easier."
            wide
          />
        </div>
      </section>

      <section className="splitSection landlordSection" id="landlords">
        <div className="splitText">
          <div className="eyebrow">
            <span className="eyebrowDot" />
            For landlords
          </div>

          <h2>
            Run your portfolio
            <br />
            like a <em>pro.</em>
          </h2>

          <p>
            From your first property to your fiftieth, Unitvero gives you the
            tools to stay organized, profitable, and in control.
          </p>

          <ul className="checkList">
            <li>
              <span>✓</span> See your entire portfolio at a glance
            </li>

            <li>
              <span>✓</span> Automate rent collection and reminders
            </li>

            <li>
              <span>✓</span> Track income, expenses, and performance
            </li>
          </ul>

          <button className="outlineButton">
            Explore landlord tools →
          </button>
        </div>

        <div className="dashboardMockup">
          <div className="mockupTop">
            <span className="mockupBrand">unitvero</span>
            <span className="mockupAvatar">JD</span>
          </div>

          <div className="mockupGreeting">
            <small>Good morning, Jordan</small>
            <h3>Portfolio overview</h3>
          </div>

          <div className="statRow">
            <div>
              <small>Total revenue</small>
              <strong>$24,680</strong>
              <em>↗ 12.8%</em>
            </div>

            <div>
              <small>Occupancy rate</small>
              <strong>94.2%</strong>
              <em>↗ 3.4%</em>
            </div>
          </div>

          <div className="chartPanel">
            <div className="panelHeader">
              <strong>Revenue overview</strong>
              <span>Last 6 months⌄</span>
            </div>

            <div className="barChart">
              <i style={{ height: "42%" }} />
              <i style={{ height: "58%" }} />
              <i style={{ height: "50%" }} />
              <i style={{ height: "72%" }} />
              <i style={{ height: "66%" }} />
              <i style={{ height: "92%" }} />
            </div>

            <div className="months">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      </section>

      <section className="splitSection tenantSection" id="tenants">
        <div className="phoneMockup">
          <div className="phoneNotch" />

          <div className="phoneScreen">
            <div className="phoneHeader">
              <span>9:41</span>
              <span>● ● ▰</span>
            </div>

            <div className="appHeader">
              <span className="mockupBrand">unitvero</span>
              <span className="phoneAvatar">AM</span>
            </div>

            <small className="welcome">Good morning, Alex</small>

            <h3>Your home</h3>

            <div className="homeImage">
              <img
                src="/unitvero-property.jpg"
                alt="Your property"
              />
            </div>

            <div className="phoneProperty">
              <strong>Willow Creek Apartments</strong>
              <small>Unit 204 · 2 bedroom</small>
            </div>

            <div className="phoneActions">
              <div>
                <span>♧</span>
                <small>Pay rent</small>
              </div>

              <div>
                <span>⌁</span>
                <small>Maintenance</small>
              </div>

              <div>
                <span>☷</span>
                <small>Documents</small>
              </div>
            </div>
          </div>
        </div>

        <div className="splitText">
          <div className="eyebrow">
            <span className="eyebrowDot" />
            For tenants
          </div>

          <h2>
            Home management,
            <br />
            <em>made human.</em>
          </h2>

          <p>
            Pay rent, report an issue, and stay connected with your property
            manager—all from a calm, intuitive app.
          </p>

          <ul className="checkList">
            <li>
              <span>✓</span> Pay rent in seconds
            </li>

            <li>
              <span>✓</span> Submit and track maintenance requests
            </li>

            <li>
              <span>✓</span> Message your property manager directly
            </li>
          </ul>

          <button className="outlineButton">
            Discover the tenant app →
          </button>
        </div>
      </section>

      <section className="proSection" id="pricing">
        <div className="proContent">
          <div className="eyebrow light">
            <span className="eyebrowDot" />
            Unitvero Pro
          </div>

          <h2>
            Built to grow
            <br />
            <em>with you.</em>
          </h2>

          <p>
            Need more power? Unitvero Pro gives growing property teams
            advanced tools, deeper insights, and dedicated support.
          </p>

          <button className="lightButton">
            Explore Unitvero Pro →
          </button>
        </div>

        <div className="proDecoration">
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="proCircle">✦</div>
        </div>
      </section>

      <section className="section testimonialSection">
        <div className="sectionHeading centered">
          <div className="eyebrow">
            <span className="eyebrowDot" />
            Loved by property people
          </div>

          <h2>
            Better tools.
            <br />
            <em>Better days.</em>
          </h2>
        </div>

        <div className="testimonialGrid">
          <Testimonial
            quote="Unitvero has completely changed how I run my properties. I spend less time on admin and more time growing my portfolio."
            name="Jordan Mitchell"
            role="Property owner · 24 units"
            initials="JM"
          />

          <Testimonial
            quote="Finally, a property app that feels like it was designed for actual humans. Everything is exactly where I expect it to be."
            name="Aisha Rahman"
            role="Tenant · Brooklyn, NY"
            initials="AR"
          />

          <Testimonial
            quote="Our tenants love the simplicity, and our team loves the visibility. Unitvero has become essential to our daily operations."
            name="Marcus Chen"
            role="Property manager · 180 units"
            initials="MC"
          />
        </div>
      </section>

      <section className="ctaSection" id="contact">
        <div className="eyebrow light">
          <span className="eyebrowDot" />
          Ready when you are
        </div>

        <h2>
          Property management,
          <br />
          <em>finally made simple.</em>
        </h2>

        <p>Start your free account today. No credit card required.</p>

        <button className="lightButton">
          Get started for free →
        </button>
      </section>

      <footer className="footer">
        <div className="footerTop">
          <div>
            <a href="#" className="logo">
              unit<span>vero</span>
            </a>

            <p>
              The simpler way to manage
              <br />
              property.
            </p>
          </div>

          <div className="footerLinks">
            <div>
              <strong>Product</strong>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Updates</a>
            </div>

            <div>
              <strong>Company</strong>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>

            <div>
              <strong>Legal</strong>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>

        <div className="footerBottom">
          <span>© 2025 Unitvero. All rights reserved.</span>
          <span>Made for better living ✦</span>
        </div>
      </footer>

      {showVideo && (
        <div
          className="modalOverlay"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="videoModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="closeButton"
              onClick={() => setShowVideo(false)}
              aria-label="Close video"
            >
              ×
            </button>

            <video controls autoPlay>
              <source
                src="/unitvero-demo.mp4"
                type="video/mp4"
              />
              Your browser does not support video playback.
            </video>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap");

        :root {
          --background: #111210;
          --surface: #1a1b18;
          --surface-light: #24251f;
          --cream: #f1eee5;
          --muted: #a6a59a;
          --gold: #d4aa62;
          --gold-light: #e6c98d;
          --line: rgba(241, 238, 229, 0.13);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--background);
          color: var(--cream);
          font-family: "DM Sans", sans-serif;
        }

        button,
        a {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .site {
          min-height: 100vh;
          overflow: hidden;
        }

        .navbar {
          align-items: center;
          display: flex;
          height: 86px;
          justify-content: space-between;
          margin: auto;
          max-width: 1240px;
          padding: 0 28px;
        }

        .logo {
          color: var(--cream);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -1.4px;
        }

        .logo span {
          color: var(--gold);
        }

        .navLinks {
          display: flex;
          gap: 34px;
          margin-left: 100px;
        }

        .navLinks a,
        .loginButton {
          color: var(--muted);
          font-size: 13px;
          transition: color 0.2s;
        }

        .navLinks a:hover,
        .loginButton:hover {
          color: var(--cream);
        }

        .navActions {
          align-items: center;
          display: flex;
          gap: 22px;
        }

        .loginButton {
          background: none;
          border: 0;
        }

        .primaryButton,
        .lightButton,
        .outlineButton {
          border-radius: 4px;
          font-weight: 600;
          padding: 15px 24px;
          transition: 0.2s;
        }

        .primaryButton {
          background: var(--gold);
          border: 1px solid var(--gold);
          color: #171610;
        }

        .primaryButton:hover {
          background: var(--gold-light);
          border-color: var(--gold-light);
          transform: translateY(-2px);
        }

        .primaryButton.small {
          padding: 11px 18px;
        }

        .menuButton {
          background: transparent;
          border: 0;
          display: none;
          padding: 5px;
        }

        .menuButton span {
          background: var(--cream);
          display: block;
          height: 2px;
          margin: 5px;
          width: 22px;
        }

        .hero {
          align-items: center;
          display: grid;
          gap: 40px;
          grid-template-columns: 0.93fr 1.07fr;
          margin: auto;
          max-width: 1240px;
          min-height: 670px;
          padding: 80px 28px 110px;
        }

        .eyebrow {
          align-items: center;
          color: var(--gold);
          display: flex;
          font-size: 11px;
          font-weight: 600;
          gap: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .eyebrowDot {
          background: var(--gold);
          border-radius: 50%;
          height: 6px;
          width: 6px;
        }

        h1,
        h2 {
          font-weight: 500;
          letter-spacing: -3px;
          line-height: 0.98;
          margin: 24px 0;
        }

        h1 {
          font-size: clamp(52px, 6vw, 80px);
        }

        h2 {
          font-size: clamp(44px, 5vw, 66px);
        }

        h1 em,
        h2 em {
          color: var(--gold);
          font-family: "Playfair Display", serif;
          font-weight: 500;
        }

        .heroText,
        .splitText > p {
          color: var(--muted);
          font-size: 16px;
          line-height: 1.75;
          max-width: 450px;
        }

        .heroButtons {
          align-items: center;
          display: flex;
          gap: 26px;
          margin-top: 34px;
        }

        .watchButton {
          align-items: center;
          background: transparent;
          border: 0;
          color: var(--cream);
          display: flex;
          font-size: 14px;
          gap: 10px;
        }

        .playIcon {
          align-items: center;
          border: 1px solid var(--gold);
          border-radius: 50%;
          color: var(--gold);
          display: inline-flex;
          font-size: 9px;
          height: 30px;
          justify-content: center;
          padding-left: 2px;
          width: 30px;
        }

        .heroTrust {
          align-items: center;
          display: flex;
          gap: 13px;
          margin-top: 68px;
        }

        .avatarStack {
          display: flex;
        }

        .avatarStack span {
          align-items: center;
          background: #6c6658;
          border: 2px solid var(--background);
          border-radius: 50%;
          color: #fff;
          display: flex;
          font-size: 9px;
          height: 28px;
          justify-content: center;
          margin-left: -7px;
          width: 28px;
        }

        .avatarStack span:first-child {
          margin-left: 0;
          background: #9a795c;
        }

        .avatarStack span:nth-child(2) {
          background: #758a83;
        }

        .avatarStack span:nth-child(3) {
          background: #8c6870;
        }

        .avatarStack span:last-child {
          background: var(--surface-light);
          color: var(--gold);
        }

        .heroTrust strong,
        .heroTrust small {
          display: block;
        }

        .heroTrust strong {
          font-size: 11px;
        }

        .heroTrust small {
          color: var(--muted);
          font-size: 10px;
          margin-top: 4px;
        }

        .heroVisual {
          min-height: 500px;
          position: relative;
        }

        .glow {
          background: rgba(188, 145, 75, 0.18);
          border-radius: 50%;
          filter: blur(80px);
          height: 280px;
          position: absolute;
          right: 20%;
          top: 18%;
          width: 280px;
        }

        .heroImageFrame {
          border-radius: 2px;
          height: 430px;
          overflow: hidden;
          position: absolute;
          right: 4%;
          top: 28px;
          transform: rotate(3deg);
          width: 78%;
        }

        .heroImage {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .floatingCard {
          backdrop-filter: blur(15px);
          background: rgba(29, 30, 26, 0.93);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 5px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          position: absolute;
          z-index: 2;
        }

        .incomeCard {
          left: 3%;
          padding: 18px;
          top: 105px;
          width: 170px;
        }

        .cardLabel,
        .paymentCard small,
        .ratingCard small {
          color: var(--muted);
          display: block;
          font-size: 10px;
        }

        .incomeValue {
          font-size: 24px;
          font-weight: 600;
          margin-top: 5px;
        }

        .incomeChange {
          color: #83b897;
          font-size: 10px;
          margin-top: 4px;
        }

        .miniChart {
          align-items: end;
          display: flex;
          gap: 4px;
          height: 35px;
          margin-top: 12px;
        }

        .miniChart i {
          background: var(--gold);
          display: block;
          flex: 1;
          height: 35%;
        }

        .miniChart i:nth-child(2) {
          height: 55%;
        }

        .miniChart i:nth-child(3) {
          height: 45%;
        }

        .miniChart i:nth-child(4) {
          height: 70%;
        }

        .miniChart i:nth-child(5) {
          height: 58%;
        }

        .miniChart i:nth-child(6) {
          height: 88%;
        }

        .miniChart i:nth-child(7) {
          height: 72%;
        }

        .miniChart i:nth-child(8) {
          height: 100%;
        }

        .paymentCard {
          align-items: center;
          bottom: 38px;
          display: flex;
          gap: 10px;
          left: 12%;
          padding: 13px;
        }

        .checkCircle {
          align-items: center;
          background: #789b7b;
          border-radius: 50%;
          color: white;
          display: flex;
          height: 26px;
          justify-content: center;
          width: 26px;
        }

        .paymentCard strong {
          display: block;
          font-size: 11px;
          margin-bottom: 3px;
        }

        .ratingCard {
          bottom: 110px;
          padding: 13px 17px;
          right: 0;
        }

        .ratingCard span {
          color: var(--gold);
          font-size: 12px;
          letter-spacing: 2px;
        }

        .ratingCard strong {
          display: block;
          font-size: 21px;
          margin-top: 4px;
        }

        .logoStrip {
          border-bottom: 1px solid var(--line);
          border-top: 1px solid var(--line);
          color: var(--muted);
          display: flex;
          justify-content: space-between;
          margin: auto;
          max-width: 1184px;
          padding: 24px 0;
        }

        .logoStrip > span {
          font-size: 11px;
        }

        .logoItems {
          align-items: center;
          display: flex;
          gap: 42px;
        }

        .logoItems b {
          color: #716f65;
          font-size: 14px;
        }

        .logoItems span {
          color: var(--gold);
        }

        .section {
          margin: auto;
          max-width: 1184px;
          padding: 145px 0;
        }

        .sectionHeading.centered {
          margin: auto;
          text-align: center;
        }

        .sectionHeading.centered .eyebrow {
          justify-content: center;
        }

        .sectionHeading h2 {
          margin: 22px 0 18px;
        }

        .sectionHeading p {
          color: var(--muted);
          line-height: 1.7;
          margin: auto;
          max-width: 450px;
        }

        .featureGrid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 65px;
        }

        .featureCard {
          background: var(--surface);
          border: 1px solid var(--line);
          min-height: 210px;
          padding: 27px;
        }

        .featureCard.large {
          grid-row: span 2;
          min-height: 434px;
        }

        .featureCard.wide {
          grid-column: span 2;
        }

        .featureIcon {
          align-items: center;
          background: rgba(212, 170, 98, 0.12);
          border-radius: 50%;
          color: var(--gold);
          display: flex;
          font-size: 20px;
          height: 45px;
          justify-content: center;
          width: 45px;
        }

        .featureCard h3 {
          font-size: 18px;
          font-weight: 500;
          margin: 28px 0 10px;
        }

        .featureCard p {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
          margin: 0;
          max-width: 270px;
        }

        .splitSection {
          align-items: center;
          display: grid;
          gap: 110px;
          grid-template-columns: 1fr 1fr;
          margin: auto;
          max-width: 1184px;
          padding: 130px 0;
        }

        .splitText h2 {
          margin-bottom: 24px;
        }

        .checkList {
          list-style: none;
          margin: 30px 0;
          padding: 0;
        }

        .checkList li {
          align-items: center;
          color: var(--cream);
          display: flex;
          font-size: 13px;
          gap: 12px;
          margin: 15px 0;
        }

        .checkList span {
          align-items: center;
          background: rgba(212, 170, 98, 0.14);
          border-radius: 50%;
          color: var(--gold);
          display: flex;
          font-size: 11px;
          height: 21px;
          justify-content: center;
          width: 21px;
        }

        .outlineButton {
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          font-size: 13px;
        }

        .outlineButton:hover {
          background: var(--gold);
          color: #171610;
        }

        .dashboardMockup {
          background: #e8e3d8;
          border-radius: 6px;
          box-shadow: 20px 24px 50px rgba(0, 0, 0, 0.3);
          color: #242720;
          padding: 22px;
          transform: rotate(2deg);
        }

        .mockupTop,
        .panelHeader,
        .phoneHeader,
        .appHeader {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }

        .mockupBrand {
          color: #20251f;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .mockupAvatar,
        .phoneAvatar {
          align-items: center;
          background: #b58a58;
          border-radius: 50%;
          color: white;
          display: flex;
          font-size: 9px;
          height: 27px;
          justify-content: center;
          width: 27px;
        }

        .mockupGreeting {
          margin: 37px 0 20px;
        }

        .mockupGreeting small,
        .statRow small {
          color: #77796e;
          display: block;
          font-size: 10px;
        }

        .mockupGreeting h3 {
          font-size: 25px;
          font-weight: 500;
          margin: 6px 0;
        }

        .statRow {
          display: grid;
          gap: 10px;
          grid-template-columns: 1fr 1fr;
        }

        .statRow > div,
        .chartPanel {
          background: #f5f1e9;
          padding: 15px;
        }

        .statRow strong {
          display: block;
          font-size: 22px;
          margin: 7px 0 3px;
        }

        .statRow em {
          color: #63896c;
          font-size: 10px;
          font-style: normal;
        }

        .chartPanel {
          margin-top: 10px;
        }

        .panelHeader {
          font-size: 11px;
        }

        .panelHeader span {
          color: #8b8a80;
          font-size: 9px;
        }

        .barChart {
          align-items: end;
          display: flex;
          gap: 9px;
          height: 130px;
          margin: 16px 5px 6px;
        }

        .barChart i {
          background: #c3a066;
          border-radius: 2px 2px 0 0;
          flex: 1;
        }

        .months {
          color: #929185;
          display: flex;
          font-size: 8px;
          justify-content: space-between;
        }

        .tenantSection {
          grid-template-columns: 0.9fr 1.1fr;
        }

        .phoneMockup {
          background: #282923;
          border: 7px solid #3a3b34;
          border-radius: 33px;
          box-shadow: 20px 25px 50px rgba(0, 0, 0, 0.35);
          justify-self: center;
          padding: 8px;
          position: relative;
          transform: rotate(-5deg);
          width: 275px;
        }

        .phoneNotch {
          background: #3a3b34;
          border-radius: 0 0 12px 12px;
          height: 18px;
          left: 50%;
          position: absolute;
          top: -7px;
          transform: translateX(-50%);
          width: 90px;
          z-index: 2;
        }

        .phoneScreen {
          background: #ede9df;
          border-radius: 22px;
          color: #272821;
          min-height: 510px;
          padding: 15px;
        }

        .phoneHeader {
          font-size: 8px;
          margin-bottom: 24px;
        }

        .appHeader {
          margin-bottom: 25px;
        }

        .phoneScreen .mockupBrand {
          font-size: 16px;
        }

        .welcome {
          color: #85857c;
          font-size: 10px;
        }

        .phoneScreen h3 {
          font-size: 23px;
          font-weight: 500;
          margin: 5px 0 16px;
        }

        .homeImage {
          border-radius: 8px;
          height: 132px;
          overflow: hidden;
        }

        .homeImage img {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .phoneProperty {
          margin: 12px 0 23px;
        }

        .phoneProperty strong,
        .phoneProperty small {
          display: block;
        }

        .phoneProperty strong {
          font-size: 13px;
        }

        .phoneProperty small {
          color: #86857a;
          font-size: 9px;
          margin-top: 4px;
        }

        .phoneActions {
          border-top: 1px solid #d5d0c5;
          display: flex;
          justify-content: space-between;
          padding-top: 20px;
          text-align: center;
        }

        .phoneActions div {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .phoneActions span {
          color: #b38b58;
          font-size: 21px;
        }

        .phoneActions small {
          color: #74746b;
          font-size: 8px;
        }

        .proSection,
        .ctaSection {
          background: var(--gold);
          color: #1c1c16;
          margin: 70px auto 0;
          max-width: 1184px;
          min-height: 440px;
          overflow: hidden;
          padding: 85px;
          position: relative;
        }

        .proContent {
          position: relative;
          z-index: 2;
        }

        .proSection .eyebrow,
        .ctaSection .eyebrow {
          color: #564729;
        }

        .proSection .eyebrowDot,
        .ctaSection .eyebrowDot {
          background: #564729;
        }

        .proSection h2,
        .ctaSection h2 {
          margin: 22px 0;
        }

        .proSection h2 em,
        .ctaSection h2 em {
          color: #66502a;
        }

        .proSection p,
        .ctaSection p {
          color: #665a3f;
          font-size: 15px;
          line-height: 1.7;
          max-width: 400px;
        }

        .lightButton {
          background: #1d1e18;
          border: 1px solid #1d1e18;
          color: var(--cream);
          margin-top: 18px;
        }

        .lightButton:hover {
          background: #36372b;
        }

        .proDecoration {
          height: 420px;
          position: absolute;
          right: 60px;
          top: 0;
          width: 420px;
        }

        .orbit {
          border: 1px solid rgba(46, 41, 24, 0.35);
          border-radius: 50%;
          height: 360px;
          left: 30px;
          position: absolute;
          top: 32px;
          transform: rotate(35deg);
          width: 360px;
        }

        .orbitTwo {
          height: 270px;
          left: 75px;
          top: 78px;
          transform: rotate(-35deg);
          width: 270px;
        }

        .proCircle {
          align-items: center;
          background: #ead09a;
          border-radius: 50%;
          display: flex;
          font-size: 45px;
          height: 125px;
          justify-content: center;
          left: 148px;
          position: absolute;
          top: 145px;
          width: 125px;
        }

        .testimonialSection {
          padding-bottom: 130px;
        }

        .testimonialGrid {
          display: grid;
          gap: 15px;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 65px;
        }

        .testimonial {
          background: var(--surface);
          border: 1px solid var(--line);
          padding: 28px;
        }

        .quoteMark {
          color: var(--gold);
          font-family: Georgia, serif;
          font-size: 42px;
          line-height: 0.8;
        }

        .testimonial blockquote {
          font-family: "Playfair Display", serif;
          font-size: 17px;
          line-height: 1.6;
          margin: 20px 0 30px;
        }

        .person {
          align-items: center;
          display: flex;
          gap: 11px;
        }

        .personAvatar {
          align-items: center;
          background: #92705d;
          border-radius: 50%;
          display: flex;
          font-size: 10px;
          height: 32px;
          justify-content: center;
          width: 32px;
        }

        .person strong,
        .person small {
          display: block;
        }

        .person strong {
          font-size: 11px;
        }

        .person small {
          color: var(--muted);
          font-size: 9px;
          margin-top: 3px;
        }

        .ctaSection {
          align-items: center;
          display: flex;
          flex-direction: column;
          margin-top: 0;
          min-height: 400px;
          padding: 75px 20px;
          text-align: center;
        }

        .ctaSection p {
          margin: 0;
        }

        .ctaSection h2 {
          margin: 20px 0;
        }

        .footer {
          margin: auto;
          max-width: 1184px;
          padding: 70px 0 25px;
        }

        .footerTop {
          display: flex;
          justify-content: space-between;
        }

        .footerTop p {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
          margin-top: 22px;
        }

        .footerLinks {
          display: flex;
          gap: 90px;
        }

        .footerLinks div {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .footerLinks strong {
          color: var(--cream);
          font-size: 11px;
          margin-bottom: 5px;
        }

        .footerLinks a {
          color: var(--muted);
          font-size: 11px;
        }

        .footerLinks a:hover {
          color: var(--gold);
        }

        .footerBottom {
          border-top: 1px solid var(--line);
          color: #686961;
          display: flex;
          font-size: 10px;
          justify-content: space-between;
          margin-top: 70px;
          padding-top: 20px;
        }

        .modalOverlay {
          align-items: center;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          inset: 0;
          justify-content: center;
          padding: 20px;
          position: fixed;
          z-index: 20;
        }

        .videoModal {
          background: #000;
          max-width: 900px;
          position: relative;
          width: 100%;
        }

        .videoModal video {
          display: block;
          width: 100%;
        }

        .closeButton {
          background: var(--gold);
          border: 0;
          border-radius: 50%;
          font-size: 25px;
          height: 34px;
          line-height: 1;
          position: absolute;
          right: -15px;
          top: -15px;
          width: 34px;
          z-index: 2;
        }

        @media (max-width: 900px) {
          .navLinks {
            gap: 16px;
            margin-left: 20px;
          }

          .hero,
          .splitSection {
            gap: 50px;
          }

          .logoStrip,
          .section,
          .splitSection,
          .footer {
            margin-left: 24px;
            margin-right: 24px;
          }

          .proSection,
          .ctaSection {
            margin-left: 24px;
            margin-right: 24px;
          }

          .proDecoration {
            opacity: 0.45;
            right: -100px;
          }
        }

        @media (max-width: 700px) {
          .navbar {
            height: 72px;
            padding: 0 20px;
          }

          .navLinks {
            background: var(--surface);
            border-bottom: 1px solid var(--line);
            display: none;
            flex-direction: column;
            gap: 22px;
            left: 0;
            margin: 0;
            padding: 25px 24px;
            position: absolute;
            right: 0;
            top: 72px;
            z-index: 10;
          }

          .navLinks.open {
            display: flex;
          }

          .navActions {
            display: none;
          }

          .menuButton {
            display: block;
          }

          .hero {
            display: block;
            min-height: auto;
            padding: 70px 20px 80px;
          }

          h1 {
            font-size: 53px;
          }

          h2 {
            font-size: 45px;
          }

          .heroTrust {
            margin-top: 45px;
          }

          .heroVisual {
            margin-top: 50px;
            min-height: 390px;
          }

          .heroImageFrame {
            height: 330px;
            right: 2%;
            width: 88%;
          }

          .incomeCard {
            left: 0;
            top: 70px;
          }

          .paymentCard {
            bottom: 17px;
            left: 4%;
          }

          .ratingCard {
            bottom: 70px;
          }

          .logoStrip {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
            margin: 0 20px;
          }

          .logoItems {
            flex-wrap: wrap;
            gap: 20px;
          }

          .section,
          .splitSection {
            margin-left: 20px;
            margin-right: 20px;
            padding: 90px 0;
          }

          .featureGrid {
            grid-template-columns: 1fr;
            margin-top: 45px;
          }

          .featureCard.large,
          .featureCard.wide {
            grid-column: auto;
            grid-row: auto;
            min-height: 210px;
          }

          .splitSection,
          .tenantSection {
            display: flex;
            flex-direction: column;
            gap: 65px;
          }

          .landlordSection .splitText {
            order: 1;
          }

          .landlordSection .dashboardMockup {
            order: 2;
          }

          .dashboardMockup {
            width: 100%;
          }

          .phoneMockup {
            align-self: center;
          }

          .proSection,
          .ctaSection {
            margin-left: 0;
            margin-right: 0;
            padding: 75px 25px;
          }

          .proDecoration {
            right: -170px;
          }

          .testimonialGrid {
            grid-template-columns: 1fr;
          }

          .footer {
            margin: 0 20px;
          }

          .footerTop {
            flex-direction: column;
            gap: 45px;
          }

          .footerLinks {
            gap: 35px;
            justify-content: space-between;
          }

          .footerBottom {
            gap: 10px;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
  large = false,
  wide = false,
}) {
  return (
    <article
      className={`featureCard ${large ? "large" : ""} ${
        wide ? "wide" : ""
      }`}
    >
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Testimonial({
  quote,
  name,
  role,
  initials,
}) {
  return (
    <article className="testimonial">
      <div className="quoteMark">“</div>

      <blockquote>{quote}</blockquote>

      <div className="person">
        <div className="personAvatar">{initials}</div>

        <div>
          <strong>{name}</strong>
          <small>{role}</small>
        </div>
      </div>
    </article>
  );
}
