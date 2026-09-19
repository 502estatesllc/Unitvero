 "use client";

import Link from "next/link";

const features = [
  ["▱", "Rent Collection", "Get paid on time,\nevery time."],
  ["⚒", "Maintenance", "Submit & track\nrequests easily."],
  ["⌕", "Tenant Screening", "Find reliable tenants."],
  ["▧", "Lease Management", "Create, sign, and\nstore leases."],
  ["▥", "Financial Reports", "Track income,\nexpenses, and profit."],
  ["▱", "Secure Messaging", "Stay connected\nin one place."],
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

const testimonials = [
  ["Landon R.", "Property Owner", "“Unitvero has made managing my properties so much easier. Everything I need is in one place.”"],
  ["Tyesha M.", "Tenant", "“I love how easy it is to pay rent and submit maintenance requests. Great app!”"],
  ["Marcus T.", "Real Estate Investor", "“Clean, modern, and powerful. Exactly what I needed to manage my portfolio.”"],
];

export default function Home() {
  return (
    <main className="uvHome">
      <nav className="uvNav">
        <Link className="uvBrand" href="/">
          <span className="uvLogoMark">⌂</span>
          <b>Unitvero</b>
        </Link>

        <div className="uvNavLinks">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
        </div>

        <div className="uvNavActions">
          <Link className="uvLogin" href="/login">Log In</Link>
          <Link className="uvGoldButton uvNavButton" href="/signup">Get Started</Link>
        </div>
      </nav>

      <section className="uvHero">
        <div className="uvHeroCopy">
          <span className="uvPill">PROPERTY MANAGEMENT MADE SIMPLE</span>
          <h1>
            Smarter<br />
            Property<br />
            <span>Management</span><br />
            Starts Here.
          </h1>
          <p>
            Everything landlords and tenants need in one modern platform.
            Manage properties, collect rent, handle maintenance, track finances,
            and stay connected — all in one place.
          </p>

          <div className="uvHeroButtons">
            <Link className="uvGoldButton" href="/signup">Get Started <b>→</b></Link>
            <a className="uvDarkButton" href="#features"><span>▶</span> Watch Demo</a>
          </div>

          <div className="uvFreeNote">
            <b>1 Month of Pro Free</b>
            <span>•</span>
            <span>No Credit Card Required</span>
          </div>
        </div>

        <div className="uvHeroVisual">
          <div className="uvHouseScene">
            <div className="uvHouseGlow"></div>
            <div className="uvHouseRoof"></div>
            <div className="uvHouseFloor floorOne"></div>
            <div className="uvHouseFloor floorTwo"></div>
            <div className="uvHouseWindow w1"></div>
            <div className="uvHouseWindow w2"></div>
            <div className="uvHouseWindow w3"></div>
            <div className="uvHouseWindow w4"></div>
          </div>

          <div className="uvRevenueCard">
            <small>Monthly Revenue</small>
            <strong>$48,750</strong>
            <span>↑ 12% from last month</span>
            <div className="uvMiniBars">
              {[22, 30, 25, 38, 31, 47, 55].map((h, i) => <i key={i} style={{height:`${h}px`}} />)}
            </div>
          </div>

          <div className="uvOccupancyCard">
            <small>Occupancy Rate</small>
            <strong>92%</strong>
            <span>↑ 4% from last month</span>
            <div className="uvRing"><b>92%</b></div>
          </div>

          <div className="uvPropertyCard">
            <div className="uvPropertyThumb">⌂</div>
            <div>
              <small>Property Managed</small>
              <strong>1234 Maple St.</strong>
              <span>Unit 2A</span>
            </div>
          </div>
        </div>
      </section>

      <section className="uvFeatures" id="features">
        {features.map(([icon, title, text]) => (
          <article key={title}>
            <div className="uvFeatureIcon">{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="uvAudience" id="about">
        <article className="uvAudienceCard">
          <div>
            <span className="uvSectionTag">FOR LANDLORDS</span>
            <h2>More Control.<br />Less Work.</h2>
            <ul>
              {landlordItems.map(item => <li key={item}>✓ <span>{item}</span></li>)}
            </ul>
            <Link className="uvGoldButton" href="/signup">Get Started as a Landlord <b>→</b></Link>
          </div>
          <div className="uvPhone landlordPhone">
            <div className="uvPhoneTop">9:41 <span>Unitvero</span> ⋯</div>
            <div className="uvPhoneScreen">
              <b>$48,750</b>
              <span>Total Revenue</span>
              <div className="uvPhoneChart">
                {[20,31,26,40,33,50,61].map((h,i)=><i key={i} style={{height:`${h}px`}} />)}
              </div>
              <div className="uvPhoneTiles"><i/><i/><i/></div>
            </div>
          </div>
        </article>

        <article className="uvAudienceCard">
          <div>
            <span className="uvSectionTag">FOR TENANTS</span>
            <h2>A Better Renting<br />Experience.</h2>
            <ul>
              {tenantItems.map(item => <li key={item}>✓ <span>{item}</span></li>)}
            </ul>
            <Link className="uvGoldButton" href="/signup">Get Started as a Tenant <b>→</b></Link>
          </div>
          <div className="uvPhone tenantPhone">
            <div className="uvPhoneTop">9:41 <span>Unitvero</span> ☰</div>
            <div className="uvTenantGreeting">Good Morning,<br /><b>Tenant!</b></div>
            <div className="uvTenantTiles">
              <i>Pay Rent</i><i>Maintenance</i><i>Messages</i><i>Documents</i>
            </div>
          </div>
        </article>
      </section>

      <section className="uvPro" id="pricing">
        <div className="uvCrown">♛</div>
        <div className="uvProCopy">
          <span className="uvSectionTag">UNITVERO PRO</span>
          <h2>Try Unitvero Pro Free for 1 Month</h2>
          <p>Unlock advanced features and take your property management to the next level.</p>
        </div>
        <div className="uvProFeatures">
          <span>▧ Advanced Reports</span>
          <span>◉ Priority Support</span>
          <span>♙ Unlimited Properties</span>
          <span>⌁ Custom Branding</span>
        </div>
        <Link className="uvGoldButton" href="/signup">Get 1 Month Free <b>→</b></Link>
      </section>

      <section className="uvTestimonials" id="resources">
        <div className="uvSectionHeading">
          <h2>Trusted by Landlords and Tenants</h2>
          <p>See what our users are saying about Unitvero.</p>
        </div>
        <div className="uvTestimonialGrid">
          {testimonials.map(([name, role, quote], i) => (
            <article key={name}>
              <div className="uvTestimonialTop">
                <div className="uvAvatar">{["L","T","M"][i]}</div>
                <div><b>{name}</b><span>{role}</span></div>
              </div>
              <p>{quote}</p>
              <strong>★★★★★</strong>
            </article>
          ))}
        </div>
      </section>

      <footer className="uvFooter">
        <Link className="uvBrand" href="/">
          <span className="uvLogoMark">⌂</span>
          <b>Unitvero</b>
        </Link>
        <span>Manage Today. Build Tomorrow.</span>
        <div>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#resources">Resources</a>
          <a href="#about">About</a>
          <Link href="/login">Contact</Link>
        </div>
        <div className="uvSocial">𝕏 ◎ in ▶</div>
      </footer>

      <section className="uvMobileShowcase">
        <div className="uvMobilePhone">
          <div className="uvMobileNotch"></div>
          <div className="uvMobileBrand">⌂ Unitvero</div>
          <span className="uvPill">PROPERTY MANAGEMENT MADE SIMPLE</span>
          <h3>Smarter Property<br /><b>Management</b><br />Starts Here.</h3>
          <div className="uvMobileHouse"></div>
          <button>Get Started →</button>
        </div>
        <div className="uvMobilePhone">
          <div className="uvMobileNotch"></div>
          <div className="uvMobileBrand">⌂ Unitvero</div>
          <h3>Good Morning,<br />Landon! 👋</h3>
          <div className="uvMobileStats"><i>$48,750<small>Total Revenue</small></i><i>92%<small>Occupancy</small></i></div>
          <div className="uvMobileStats"><i>48<small>Properties</small></i><i>4<small>Maintenance</small></i></div>
          <div className="uvMobileNav">⌂　▧　◇　☰</div>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        :root{color-scheme:dark}
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;background:#050606;color:#f5f2e9;font-family:Inter,Arial,sans-serif}
        a{text-decoration:none;color:inherit}
        button,input,textarea,select{font:inherit}

        .uvHome{
          min-height:100vh;
          overflow:hidden;
          background:
            radial-gradient(circle at 73% 16%,rgba(244,200,79,.10),transparent 23%),
            radial-gradient(circle at 50% 62%,rgba(244,200,79,.045),transparent 34%),
            #050606;
          color:#f5f2e9;
          font-family:Inter,Arial,sans-serif;
        }
        .uvHome *{font-family:Inter,Arial,sans-serif}

        .uvNav{
          width:min(1180px,calc(100% - 48px));
          height:76px;
          margin:auto;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:30px;
          border-bottom:1px solid rgba(244,200,79,.13);
        }
        .uvBrand{display:flex;align-items:center;gap:9px;font-size:21px;letter-spacing:-.055em}
        .uvLogoMark{
          width:29px;height:29px;border:1.5px solid #f4c84f;border-radius:8px;
          display:grid;place-items:center;color:#f4c84f;font-size:18px;font-weight:900;
          box-shadow:0 0 18px rgba(244,200,79,.10)
        }
        .uvBrand b{color:#fff}
        .uvNavLinks{display:flex;gap:30px;margin-left:auto}
        .uvNavLinks a{font-size:11px;color:#969995;font-weight:600}
        .uvNavLinks a:hover{color:#fff}
        .uvNavActions{display:flex;align-items:center;gap:9px}
        .uvLogin{font-size:11px;color:#d3d0c7;font-weight:700;padding:10px 12px}
        .uvGoldButton,.uvDarkButton{
          min-height:39px;padding:0 16px;border-radius:8px;display:inline-flex;
          align-items:center;justify-content:center;gap:9px;font-size:10px;font-weight:900;
          border:1px solid rgba(244,200,79,.42);cursor:pointer;transition:.2s ease
        }
        .uvGoldButton{background:linear-gradient(135deg,#f8d66e,#dcae36);color:#111}
        .uvGoldButton:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(244,200,79,.16)}
        .uvDarkButton{background:#0d0f10;color:#eee9dd}
        .uvNavButton{min-height:35px}

        .uvHero{
          width:min(1180px,calc(100% - 48px));
          min-height:565px;
          margin:0 auto;
          display:grid;
          grid-template-columns:.78fr 1.22fr;
          gap:28px;
          align-items:center;
          position:relative;
        }
        .uvHeroCopy{padding:28px 0 35px;z-index:3}
        .uvPill,.uvSectionTag{
          display:inline-block;color:#f4c84f;font-size:8px;font-weight:900;letter-spacing:.13em
        }
        .uvPill{padding:6px 9px;border:1px solid rgba(244,200,79,.28);border-radius:999px;background:rgba(244,200,79,.05)}
        .uvHero h1{
          margin:13px 0 15px;font-size:clamp(43px,5.1vw,69px);line-height:.93;
          letter-spacing:-.065em;color:#fff
        }
        .uvHero h1 span{color:#f4c84f}
        .uvHeroCopy>p{max-width:465px;color:#aaa9a2;font-size:12px;line-height:1.65;margin:0 0 19px}
        .uvHeroButtons{display:flex;gap:8px}
        .uvFreeNote{display:flex;gap:7px;margin-top:12px;font-size:8px;color:#898b86}
        .uvFreeNote b{color:#f0e8d1}

        .uvHeroVisual{height:485px;position:relative}
        .uvHouseScene{
          position:absolute;inset:28px 0 15px 7%;
          overflow:hidden;border-radius:12px;border:1px solid rgba(244,200,79,.24);
          background:
            linear-gradient(140deg,rgba(244,200,79,.08),transparent 35%),
            linear-gradient(145deg,#28231a 0%,#151718 42%,#070809 100%);
          box-shadow:0 25px 60px rgba(0,0,0,.45)
        }
        .uvHouseGlow{position:absolute;width:280px;height:280px;right:8%;top:6%;border-radius:50%;background:radial-gradient(circle,rgba(244,200,79,.20),transparent 68%);filter:blur(7px)}
        .uvHouseRoof{position:absolute;width:75%;height:90px;right:1%;top:28%;transform:skewX(-18deg);background:linear-gradient(180deg,#222426,#0c0e0f);border:1px solid rgba(244,200,79,.22)}
        .uvHouseFloor{position:absolute;right:7%;width:64%;height:100px;border:1px solid rgba(244,200,79,.24);background:linear-gradient(180deg,rgba(37,38,35,.9),rgba(9,11,12,.9));transform:skewX(-7deg)}
        .floorOne{top:39%}.floorTwo{top:56%;right:4%}
        .uvHouseWindow{position:absolute;background:linear-gradient(135deg,#f7d66d,#6c5621 48%,#15120b);border:1px solid rgba(244,200,79,.4);box-shadow:0 0 25px rgba(244,200,79,.12)}
        .w1{width:27%;height:62px;right:34%;top:44%}.w2{width:19%;height:62px;right:9%;top:44%}
        .w3{width:31%;height:58px;right:31%;top:61%}.w4{width:18%;height:58px;right:7%;top:61%}

        .uvRevenueCard,.uvOccupancyCard,.uvPropertyCard{
          position:absolute;background:rgba(10,12,13,.96);border:1px solid rgba(244,200,79,.34);
          border-radius:10px;box-shadow:0 16px 35px rgba(0,0,0,.42);z-index:4
        }
        .uvRevenueCard{left:3%;top:17%;width:190px;padding:12px}
        .uvRevenueCard small,.uvOccupancyCard small,.uvPropertyCard small{display:block;color:#8c8f8a;font-size:7px}
        .uvRevenueCard strong,.uvOccupancyCard strong{display:block;color:#fff;font-size:20px;margin:4px 0}
        .uvRevenueCard span,.uvOccupancyCard span{font-size:7px;color:#b6cf79}
        .uvMiniBars{height:45px;display:flex;align-items:flex-end;gap:4px;justify-content:flex-end;margin-top:-17px}
        .uvMiniBars i{width:7px;background:#f4c84f;border-radius:2px 2px 0 0}
        .uvOccupancyCard{right:5%;top:42%;width:195px;padding:12px}
        .uvRing{position:absolute;right:13px;top:25px;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#f4c84f 0 92%,#2a2b2b 92% 100%)}
        .uvRing:after{content:"";position:absolute;inset:7px;border-radius:50%;background:#0a0c0d}
        .uvRing b{position:relative;z-index:1;font-size:10px;color:#fff}
        .uvPropertyCard{left:21%;bottom:6%;width:245px;padding:9px;display:flex;gap:10px;align-items:center}
        .uvPropertyThumb{width:56px;height:50px;border-radius:7px;display:grid;place-items:center;background:linear-gradient(135deg,#4b4a40,#181a19);color:#f4c84f;font-size:25px}
        .uvPropertyCard strong{display:block;color:#eeeade;font-size:10px;margin-top:4px}
        .uvPropertyCard span{display:block;color:#8d908b;font-size:8px;margin-top:2px}

        .uvFeatures{
          width:min(1180px,calc(100% - 48px));margin:0 auto 18px;
          display:grid;grid-template-columns:repeat(6,1fr);gap:8px
        }
        .uvFeatures article{text-align:center;padding:13px 7px 12px}
        .uvFeatureIcon{
          width:38px;height:38px;margin:auto;border-radius:8px;display:grid;place-items:center;
          color:#f4c84f;background:#101213;border:1px solid rgba(244,200,79,.20);font-size:18px
        }
        .uvFeatures h3{margin:7px 0 4px;font-size:9px;color:#f2f0e9}
        .uvFeatures p{white-space:pre-line;margin:0;color:#858984;font-size:7px;line-height:1.45}

        .uvAudience{width:min(1180px,calc(100% - 48px));margin:8px auto;display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .uvAudienceCard{
          min-height:300px;padding:20px;border:1px solid rgba(244,200,79,.30);border-radius:12px;
          background:linear-gradient(135deg,#15120a,#0d1011 52%,#111415);display:grid;grid-template-columns:1fr 145px;
          overflow:hidden;position:relative
        }
        .uvAudienceCard h2{font-size:24px;line-height:1;letter-spacing:-.045em;margin:7px 0 10px;color:#fff}
        .uvAudienceCard ul{list-style:none;padding:0;margin:0 0 13px;display:grid;gap:5px}
        .uvAudienceCard li{font-size:8px;color:#f4c84f}.uvAudienceCard li span{color:#b0b0a9;margin-left:3px}
        .uvAudienceCard .uvGoldButton{font-size:8px;min-height:33px;padding:0 11px}
        .uvPhone{
          width:120px;height:230px;align-self:end;justify-self:end;border:2px solid #252728;border-radius:18px;
          background:#090b0c;box-shadow:0 15px 35px rgba(0,0,0,.55);padding:10px;transform:rotate(5deg)
        }
        .uvPhoneTop{font-size:6px;color:#8f928d;display:flex;justify-content:space-between}
        .uvPhoneScreen{margin-top:16px;padding:9px;border:1px solid rgba(244,200,79,.18);border-radius:9px;background:#111415}
        .uvPhoneScreen>b{display:block;color:#fff;font-size:16px}.uvPhoneScreen>span{font-size:6px;color:#858984}
        .uvPhoneChart{height:72px;display:flex;align-items:flex-end;gap:4px;margin-top:8px}
        .uvPhoneChart i{flex:1;background:#f4c84f;border-radius:2px 2px 0 0}
        .uvPhoneTiles{display:flex;gap:4px;margin-top:8px}.uvPhoneTiles i{height:22px;flex:1;border:1px solid rgba(244,200,79,.18);border-radius:4px}
        .tenantPhone{transform:rotate(-5deg)}
        .uvTenantGreeting{margin-top:22px;font-size:8px;color:#fff;line-height:1.2}
        .uvTenantTiles{display:grid;gap:5px;margin-top:15px}.uvTenantTiles i{font-style:normal;padding:8px;background:#141718;border:1px solid rgba(244,200,79,.16);border-radius:5px;color:#f4c84f;font-size:6px}

        .uvPro{
          width:min(1180px,calc(100% - 48px));margin:10px auto;min-height:82px;padding:15px 18px;
          border:1px solid rgba(244,200,79,.38);border-radius:11px;background:linear-gradient(135deg,#181407,#0e1011);
          display:grid;grid-template-columns:58px 1.35fr 1.25fr auto;align-items:center;gap:15px
        }
        .uvCrown{font-size:40px;color:#f4c84f;text-align:center}
        .uvPro h2{margin:4px 0 2px;font-size:18px;color:#fff;letter-spacing:-.035em}
        .uvPro p{margin:0;color:#91938e;font-size:8px}
        .uvProFeatures{display:flex;flex-wrap:wrap;gap:8px 13px}.uvProFeatures span{font-size:7px;color:#c6c3b8}
        .uvPro .uvGoldButton{white-space:nowrap;min-height:33px;font-size:8px}

        .uvTestimonials{width:min(1180px,calc(100% - 48px));margin:16px auto}
        .uvSectionHeading h2{margin:0;color:#fff;font-size:18px;letter-spacing:-.035em}.uvSectionHeading p{margin:4px 0 10px;color:#858984;font-size:8px}
        .uvTestimonialGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .uvTestimonialGrid article{padding:13px;border:1px solid rgba(244,200,79,.16);border-radius:9px;background:#101213}
        .uvTestimonialTop{display:flex;align-items:center;gap:8px}.uvAvatar{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:#2a2923;color:#f4c84f;font-size:9px;font-weight:900}
        .uvTestimonialTop b{display:block;font-size:8px;color:#f5f2e9}.uvTestimonialTop span{display:block;font-size:6px;color:#858984;margin-top:2px}
        .uvTestimonialGrid p{font-size:8px;line-height:1.45;color:#a3a49f;min-height:34px}.uvTestimonialGrid strong{color:#f4c84f;font-size:9px;letter-spacing:2px}

        .uvFooter{
          width:min(1180px,calc(100% - 48px));margin:8px auto 0;padding:14px 0;
          border-top:1px solid rgba(244,200,79,.22);display:flex;align-items:center;gap:20px;color:#777a76;font-size:7px
        }
        .uvFooter .uvBrand{margin-right:auto}.uvFooter .uvBrand b{font-size:14px}
        .uvFooter>div{display:flex;gap:13px}.uvFooter a{color:#8f918c}.uvSocial{color:#d7c99e!important;font-size:11px!important}

        .uvMobileShowcase{width:min(720px,calc(100% - 48px));margin:0 auto -120px;display:flex;justify-content:center;gap:55px;position:relative}
        .uvMobilePhone{width:210px;height:395px;border:3px solid #262828;border-radius:32px;background:#090b0c;padding:25px 14px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,.45)}
        .uvMobileNotch{position:absolute;top:7px;left:50%;transform:translateX(-50%);width:75px;height:17px;border-radius:20px;background:#000}
        .uvMobileBrand{color:#fff;font-size:10px;font-weight:900;margin-bottom:17px}.uvMobileBrand:first-letter{color:#f4c84f}
        .uvMobilePhone h3{font-size:20px;line-height:1.05;color:#fff;letter-spacing:-.04em}.uvMobilePhone h3 b{color:#f4c84f}
        .uvMobileHouse{height:145px;margin:14px -14px;background:linear-gradient(145deg,#37332a,#1a1b1b 45%,#080909);border-top:1px solid rgba(244,200,79,.20);border-bottom:1px solid rgba(244,200,79,.20)}
        .uvMobilePhone button{width:100%;height:34px;border:0;border-radius:8px;background:#f4c84f;color:#111;font-size:9px;font-weight:900}
        .uvMobileStats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.uvMobileStats i{font-style:normal;padding:10px;border:1px solid rgba(244,200,79,.18);border-radius:7px;color:#fff;font-size:14px}.uvMobileStats small{display:block;color:#858984;font-size:6px;margin-top:3px}.uvMobileNav{position:absolute;bottom:13px;left:15px;right:15px;text-align:center;color:#f4c84f;font-size:15px}

        @media(max-width:900px){
          .uvNavLinks{display:none}.uvHero{grid-template-columns:1fr}.uvHeroVisual{height:430px}.uvFeatures{grid-template-columns:repeat(3,1fr)}
          .uvAudience{grid-template-columns:1fr}.uvPro{grid-template-columns:45px 1fr}.uvProFeatures{grid-column:2}.uvPro>.uvGoldButton{grid-column:2;justify-self:start}
        }
        @media(max-width:600px){
          .uvNav,.uvHero,.uvFeatures,.uvAudience,.uvPro,.uvTestimonials,.uvFooter{width:calc(100% - 24px)}
          .uvNav{height:65px}.uvNavActions{gap:3px}.uvLogin{display:none}.uvNavButton{font-size:9px}
          .uvHero{min-height:auto;margin-top:12px}.uvHero h1{font-size:47px}.uvHeroCopy{padding-top:15px}
          .uvHeroVisual{height:390px}.uvHouseScene{inset:25px 0 12px 0}.uvRevenueCard{left:2%;top:12%;width:160px}.uvOccupancyCard{right:1%;top:39%;width:170px}.uvPropertyCard{left:13%;bottom:3%;width:210px}
          .uvFeatures{grid-template-columns:repeat(2,1fr)}.uvAudienceCard{grid-template-columns:1fr;min-height:420px}.uvPhone{position:absolute;right:12px;bottom:10px}.uvAudienceCard>div:first-child{padding-right:65px}
          .uvPro{grid-template-columns:1fr;padding:17px}.uvCrown{text-align:left}.uvProFeatures{grid-column:auto}.uvPro>.uvGoldButton{grid-column:auto}
          .uvTestimonialGrid{grid-template-columns:1fr}.uvFooter{flex-wrap:wrap}.uvFooter .uvBrand{margin-right:0}.uvFooter>div{flex-wrap:wrap}.uvMobileShowcase{gap:15px}.uvMobilePhone{width:170px;height:330px;padding:22px 11px;border-radius:25px}.uvMobilePhone h3{font-size:15px}.uvMobileHouse{height:110px}
        }
      `}</style>
    </main>
  );
}
