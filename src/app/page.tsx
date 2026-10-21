import Image from "next/image";
import FishingMapLoader from "./FishingMapLoader";

const FISHING_SPOTS = [
  {
    name: "Salmon River",
    lat: 45.4211,
    lng: -116.3156,
    type: "Steelhead, Chinook, Rainbow Trout",
    desc: "Idaho's legendary 'River of No Return' — the longest free-flowing river in the lower 48. Access at Riggins, about 1 hour north. Prime steelhead water September through December.",
  },
  {
    name: "Little Salmon River",
    lat: 44.9749,
    lng: -116.2982,
    type: "Steelhead, Rainbow Trout",
    desc: "Flows right through the backyard of the lodge. Walk out the back door and wade in. 52 miles of highway-accessible water from New Meadows to Riggins.",
  },
  {
    name: "Payette Lake",
    lat: 44.9465,
    lng: -116.0853,
    type: "Kokanee, Mackinaw, Rainbow Trout",
    desc: "Nearly 5,000-acre alpine lake at McCall. Outstanding boat fishing for kokanee salmon and lake trout (mackinaw to 30+ lbs).",
  },
  {
    name: "North Fork Payette River",
    lat: 44.9073,
    lng: -116.119,
    type: "Rainbow Trout, Brook Trout",
    desc: "Flows out of Payette Lake through McCall. Excellent wading water with easy access at multiple bridges.",
  },
  {
    name: "South Fork Payette River",
    lat: 44.82,
    lng: -115.95,
    type: "Rainbow Trout, Mountain Whitefish, Bull Trout",
    desc: "Below Payette Lake near Cascade. Great trout water with easy bank access in a scenic canyon setting.",
  },
  {
    name: "Upper Payette Lake",
    lat: 45.128,
    lng: -116.0216,
    type: "Rainbow Trout, Cutthroat Trout",
    desc: "400-acre lake 16 miles north of McCall on Warren Wagon Road. Quieter and more secluded than Payette Lake. Great for canoes and float tubes.",
  },
  {
    name: "Brundage Reservoir",
    lat: 45.0528,
    lng: -116.1212,
    type: "Rainbow Trout, Cutthroat Trout",
    desc: "High-country reservoir at 6,280 ft near Brundage Mountain. Surrounded by thick pine forest. Peaceful spot for bank fishing and float tubes.",
  },
  {
    name: "Warm Lake",
    lat: 44.6464,
    lng: -115.6689,
    type: "Rainbow Trout",
    desc: "Popular lake 26 miles east of Cascade. Great camping, boating, and consistent rainbow trout fishing year-round.",
  },
  {
    name: "Little Payette Lake",
    lat: 44.9035,
    lng: -116.0415,
    type: "Smallmouth Bass, Tiger Musky",
    desc: "Just south of Payette Lake. Home of the world-record tiger musky (52+ inches, 44 lbs). Best smallmouth bass fishing mid-to-late June.",
  },
  {
    name: "Lake Cascade",
    lat: 44.599,
    lng: -116.0988,
    type: "Rainbow Trout, Yellow Perch, Kokanee, Smallmouth Bass",
    desc: "Massive 28,300-acre reservoir near Cascade, 30 minutes south of McCall. 50 miles of shoreline with jumbo yellow perch and quality trout fishing.",
  },
  {
    name: "Horsethief Reservoir",
    lat: 44.511,
    lng: -115.9158,
    type: "Rainbow Trout, Brown Trout, Kokanee",
    desc: "No-wake reservoir south of McCall at 5,055 ft. Outstanding trout fishing in a quiet setting. Campgrounds at Kings Point.",
  },
  {
    name: "Lost Valley Reservoir",
    lat: 44.9654,
    lng: -116.4634,
    type: "Rainbow Trout, Brook Trout",
    desc: "About 10 miles southwest of New Meadows. Fish grow well over winter — spring fishing yields especially large holdover rainbows.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-screen min-h-[600px]">
        <Image
          src="/images/little-salmon-canyon.jpg"
          alt="Little Salmon River canyon overlook"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div
            className="rounded-xl px-10 py-12 max-w-3xl"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <Image
              src="/images/logo.png"
              alt="The Last Resort"
              width={280}
              height={80}
              className="mx-auto mb-8 brightness-0 invert opacity-90"
            />
            <p
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: "#e0e0e0", fontFamily: "var(--font-sans)" }}
            >
              Fly Fishing Collaborative &mdash; Exclusive Donation
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 font-semibold" style={{ color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)" }}>
              Three Nights on Idaho&rsquo;s <em>Finest</em> Water
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "#ffffff", fontFamily: "var(--font-sans)" }}>
              A donated 3-night lodge stay at The Last Resort in New Meadows, Idaho
              &mdash; gateway to world-class DIY fishing on the Salmon River,
              Little Salmon, Payette Lake, and beyond.
            </p>
            <a
              href="#details"
              className="inline-block px-8 py-3 border text-sm tracking-[0.2em] uppercase transition-all hover:bg-white hover:text-black"
              style={{ color: "#ffffff", borderColor: "rgba(255,255,255,0.6)", fontFamily: "var(--font-sans)" }}
            >
              View Details
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* Details */}
      <section id="details" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: "var(--accent-dark)", fontFamily: "var(--font-sans)" }}
            >
              Lodge Donation Details
            </p>
            <h2 className="text-3xl md:text-5xl mb-6">An Inviting Escape</h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--text-body)" }}>
              Nested in the central Pacific Northwest wilderness, The Last Resort
              Lodge provides the perfect location to reach all the best fishing
              in Idaho. Located along U.S. Highway 95 in New Meadows, the lodge
              sits on the banks of the Little Salmon River.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative aspect-[4/3] rounded overflow-hidden">
              <Image
                src="/images/lodge-summer.jpg"
                alt="The Last Resort Lodge"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl mb-8">Donation Package</h3>
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                    label: "Valid Dates",
                    value: "January 1, 2027 – December 31, 2027",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    ),
                    label: "Value",
                    value: "$1,000 for 3 nights",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    ),
                    label: "Book Your Stay",
                    value: (
                      <>
                        Contact owner <strong style={{ color: "var(--text-primary)" }}>Colby Blair</strong>
                        <br />
                        <a href="tel:2083011576" className="underline hover:no-underline" style={{ color: "var(--text-primary)" }}>
                          (208) 301-1576
                        </a>
                      </>
                    ),
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ),
                    label: "Location",
                    value: (
                      <>
                        5538 Highway 95<br />
                        New Meadows, Idaho 83654
                      </>
                    ),
                    last: true,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4"
                    style={item.last ? {} : { borderBottom: "1px solid var(--stone)", paddingBottom: "1.5rem" }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "var(--stone)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm uppercase tracking-wider mb-1"
                        style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontWeight: 700 }}
                      >
                        {item.label}
                      </p>
                      <p style={{ color: "var(--text-body)" }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lodge Gallery Strip */}
      <section>
        <div className="grid grid-cols-3 gap-1">
          <div className="relative aspect-[4/3]">
            <Image src="/images/dining.jpg" alt="Lodge dining room" fill className="object-cover" />
          </div>
          <div className="relative aspect-[4/3]">
            <Image src="/images/kitchen.jpg" alt="Lodge kitchen" fill className="object-cover" />
          </div>
          <div className="relative aspect-[4/3]">
            <Image src="/images/den.jpg" alt="Lodge trophy room" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Fishing Map */}
      <section className="py-24 px-6" style={{ background: "var(--bg-warm)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: "var(--accent-dark)", fontFamily: "var(--font-sans)" }}
            >
              DIY Fishing Nearby
            </p>
            <h2 className="text-3xl md:text-5xl mb-6">World-Class Water</h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--text-body)" }}>
              The Last Resort sits at the crossroads of Idaho&rsquo;s finest
              fisheries. From steelhead on the Salmon River to kokanee on Payette
              Lake, the opportunities are endless.
            </p>
          </div>

          <div className="rounded overflow-hidden shadow-lg" style={{ height: "500px", border: "1px solid var(--stone)" }}>
            <FishingMapLoader spots={FISHING_SPOTS} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FISHING_SPOTS.map((spot) => (
              <div
                key={spot.name}
                className="p-6 rounded"
                style={{ background: "white", border: "1px solid var(--stone)" }}
              >
                <h4 className="text-lg mb-2">{spot.name}</h4>
                <p
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: "var(--accent-dark)", fontFamily: "var(--font-sans)" }}
                >
                  {spot.type}
                </p>
                <p className="text-sm" style={{ color: "var(--text-body)" }}>
                  {spot.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-32 px-6">
        <Image
          src="/images/little-salmon-fall.jpg"
          alt="Little Salmon River in fall"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center">
          <h2 className="text-white text-3xl md:text-5xl mb-6">
            We can&rsquo;t wait to see you.
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto" style={{ fontFamily: "var(--font-sans)" }}>
            Book your 3-night stay and experience Idaho&rsquo;s best fishing,
            right from the lodge&rsquo;s back door.
          </p>
          <a
            href="tel:2083011576"
            className="inline-block px-10 py-4 bg-white text-black text-sm tracking-[0.2em] uppercase transition-all hover:bg-white/90"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Call (208) 301-1576
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center" style={{ background: "#1d1d1d", color: "#c6c5b3" }}>
        <Image
          src="/images/logo.png"
          alt="The Last Resort"
          width={180}
          height={50}
          className="mx-auto mb-6 brightness-0 invert opacity-70"
        />
        <p className="text-sm mb-1" style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.5)" }}>
          5538 HWY 95, New Meadows, Idaho 83654
        </p>
        <p className="text-sm mb-4" style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.5)" }}>
          <a href="tel:2083011576" className="hover:text-white transition-colors">(208) 301-1576</a>
          {" · "}
          <a href="mailto:book@flyfishidaho.us" className="hover:text-white transition-colors">book@flyfishidaho.us</a>
        </p>
        <p className="text-xs" style={{ fontFamily: "var(--font-sans)", color: "rgba(255,255,255,0.3)" }}>
          Fly Fishing Collaborative Donation &mdash; Valid January 1 &ndash; December 31, 2027
        </p>
      </footer>
    </main>
  );
}
