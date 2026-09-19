"use client";

import Link from "next/link";

const features = [
  {
    icon: "⌂",
    title: "Property management",
    text: "Keep properties, units, tenants, leases, and documents organized in one place.",
  },
  {
    icon: "$",
    title: "Rent tracking",
    text: "Track charges, payments, outstanding balances, and payout activity with clarity.",
  },
  {
    icon: "✉",
    title: "Tenant communication",
    text: "Message tenants, share announcements, and keep important conversations together.",
  },
  {
    icon: "◇",
    title: "Maintenance requests",
    text: "Stay ahead of repairs and keep every request connected to the correct property.",
  },
  {
    icon: "▣",
    title: "Rental applications",
    text: "Review applicants and move qualified renters into your portfolio faster.",
  },
  {
    icon: "◎",
    title: "Portfolio insights",
    text: "See occupancy, rent collection, property values, and market-rent comparisons.",
  },
];

export default function Home() {
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

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">PROPERTY MANAGEMENT, SIMPLIFIED</span>
          <h1>
            Run your rentals.
            <span> Grow your portfolio.</span>
          </h1>
          <p>
            Unitvero brings properties, tenants, rent, applications,
            communication, and financial insights into one clean workspace.
          </p>

          <div className="heroActions">
            <Link className="primaryButton" href="/signup">
              Start managing free <span>→</span>
            </Link>
            <a className="secondaryButton" href="#features">
              Explore features
            </a>
          </div>

          <div className="trustRow">
            <span>✓ No complicated setup</span>
            <span>✓ Built for independent landlords</span>
            <span>✓ Works on phone and computer</span>
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
                <i className="green">✓</i>
                <span>
                  <b>Rent received</b>
                  <small>Today</small>
                </span>
              </div>
              <div>
                <i className="blue">✉</i>
                <span>
                  <b>New tenant message</b>
                  <small>2 hours ago</small>
                </span>
              </div>
              <div>
                <i className="orange">◇</i>
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
        * {
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
          background: #f8fafc;
          color: #172033;
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
              rgba(53, 103, 218, 0.14),
              transparent 28%
            ),
            #f8fafc;
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
          color: #3567da;
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
          color: #3567da;
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
          color: #3567da;
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
        .activityCard i.green {
          background: #e3f8ef;
          color: #14845f;
        }
        .activityCard i.blue {
          background: #e7efff;
          color: #3567da;
        }
        .activityCard i.orange {
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
          color: #3567da;
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
      `}</style>
    </main>
  );
}
