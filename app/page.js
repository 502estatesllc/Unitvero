import Link from 'next/link';

export default function Home() {
  return (
    <main className="unitveroLanding">

      <nav className="landingNav">
        <Link href="/" className="landingLogo">
          unit<span>vero</span>
        </Link>

        <div className="landingNavLinks">
          <a href="#features">Features</a>
          <a href="#payments">Rent Collection</a>
          <a href="#management">Management</a>
        </div>

        <div className="landingNavActions">
          <Link className="landingSignIn" href="/login">
            Sign in
          </Link>

          <Link className="landingGetStarted" href="/login">
            Get started
          </Link>
        </div>
      </nav>


      <section className="landingHero">

        <div className="landingHeroGlow" />

        <div className="landingHeroContent">

          <div className="landingEyebrow">
            PROPERTY MANAGEMENT, SIMPLIFIED
          </div>

          <h1>
            Run your rentals.
            <br />
            <span>All in one place.</span>
          </h1>

          <p>
            Unitvero gives landlords one simple workspace to
            manage properties, tenants, rent, leases,
            maintenance, payments and communication.
          </p>

          <div className="landingHeroActions">
            <Link className="landingPrimary" href="/login">
              Get started
              <span>→</span>
            </Link>

            <Link
              className="landingSecondary"
              href="/dashboard"
            >
              Preview dashboard
            </Link>
          </div>

          <div className="landingTrust">
            <span>✓ Built for landlords</span>
            <span>✓ Secure rent payments</span>
            <span>✓ Simple portfolio management</span>
          </div>

        </div>


        <div className="landingDashboardPreview">

          <div className="previewWindow">

            <div className="previewTopbar">
              <div className="previewDots">
                <i />
                <i />
                <i />
              </div>

              <span>Unitvero Dashboard</span>
            </div>

            <div className="previewBody">

              <aside className="previewSidebar">
                <b>
                  unit<span>vero</span>
                </b>

                <div className="previewNav active">
                  Overview
                </div>

                <div className="previewNav">
                  Properties
                </div>

                <div className="previewNav">
                  Tenants
                </div>

                <div className="previewNav">
                  Rent
                </div>

                <div className="previewNav">
                  Payments
                </div>
              </aside>


              <div className="previewContent">

                <small>PORTFOLIO OVERVIEW</small>

                <h3>Good afternoon</h3>

                <div className="previewStats">

                  <article>
                    <span>Monthly Rent</span>
                    <b>$8,450</b>
                    <small>EXPECTED</small>
                  </article>

                  <article>
                    <span>Collected</span>
                    <b>$7,200</b>
                    <small>THIS MONTH</small>
                  </article>

                  <article>
                    <span>Occupancy</span>
                    <b>92%</b>
                    <small>PORTFOLIO</small>
                  </article>

                </div>


                <div className="previewMainGrid">

                  <div className="previewCard">
                    <div className="previewCardHeader">
                      <b>Rent Collection</b>
                      <span>View ledger</span>
                    </div>

                    <div className="previewProgress">
                      <div />
                    </div>

                    <div className="previewRentNumbers">
                      <span>$7,200 collected</span>
                      <span>$1,250 remaining</span>
                    </div>
                  </div>


                  <div className="previewCard">
                    <div className="previewCardHeader">
                      <b>Portfolio</b>
                      <span>8 units</span>
                    </div>

                    <div className="previewProperty">
                      <i>⌂</i>

                      <div>
                        <b>Rental Property</b>
                        <span>Occupied</span>
                      </div>

                      <strong>$1,250</strong>
                    </div>

                    <div className="previewProperty">
                      <i>⌂</i>

                      <div>
                        <b>Rental Property</b>
                        <span>Occupied</span>
                      </div>

                      <strong>$1,100</strong>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

      </section>


      <section
        className="landingFeatureIntro"
        id="features"
      >
        <small>EVERYTHING YOU NEED</small>

        <h2>
          Less paperwork.
          <br />
          More control.
        </h2>

        <p>
          From your first property to a growing portfolio,
          Unit
