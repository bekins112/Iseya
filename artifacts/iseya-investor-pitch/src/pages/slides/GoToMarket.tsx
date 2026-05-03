const base = import.meta.env.BASE_URL;

export default function GoToMarket() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          08 &middot; Go-to-Market
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[40vw]">
        <h2 className="font-display font-black text-[4.4vw] leading-[0.95] tracking-tight">
          City-by-city,
          <span className="block text-accent">supply-side first.</span>
        </h2>
        <p className="font-body text-[1.2vw] text-muted mt-[2.4vh] leading-snug max-w-[36vw]">
          We seed each city with verified workers and agents before unlocking employer
          marketing. Liquidity matters more than logos.
        </p>

        <div className="mt-[4vh] flex flex-col gap-[2vh]">
          <div className="flex items-start gap-[1.4vw]">
            <span className="font-display font-black text-[1.6vw] text-primary leading-none w-[3vw]">01</span>
            <div>
              <p className="font-display font-bold text-[1.3vw]">Lagos &rarr; Abuja &rarr; PH</p>
              <p className="font-body text-[1.05vw] text-muted leading-snug">
                Three-city rollout in year one. Density before breadth.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.4vw]">
            <span className="font-display font-black text-[1.6vw] text-primary leading-none w-[3vw]">02</span>
            <div>
              <p className="font-display font-bold text-[1.3vw]">Hiring company partnerships</p>
              <p className="font-body text-[1.05vw] text-muted leading-snug">
                Cleaning, security, catering and logistics SMEs as anchor accounts.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.4vw]">
            <span className="font-display font-black text-[1.6vw] text-primary leading-none w-[3vw]">03</span>
            <div>
              <p className="font-display font-bold text-[1.3vw]">Agent network expansion</p>
              <p className="font-body text-[1.05vw] text-muted leading-snug">
                Convert informal middlemen into commission-earning Iṣéyá agents.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.4vw]">
            <span className="font-display font-black text-[1.6vw] text-primary leading-none w-[3vw]">04</span>
            <div>
              <p className="font-display font-bold text-[1.3vw]">Social distribution</p>
              <p className="font-body text-[1.05vw] text-muted leading-snug">
                Auto-posted Facebook listings, WhatsApp share links, radio sponsorships.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-[6vw] top-[14vh] bottom-[6vh] w-[44vw] flex items-center justify-center gap-[1.6vw]">
        <img
          src={`${base}img/mobile-dashboard.png`}
          crossOrigin="anonymous"
          alt="Worker dashboard mobile"
          className="h-[78%] w-auto rounded-[1vw] shadow-2xl ring-1 ring-text/10"
        />
        <img
          src={`${base}img/mobile-employer.png`}
          crossOrigin="anonymous"
          alt="Employer mobile"
          className="h-[88%] w-auto rounded-[1vw] shadow-2xl ring-1 ring-text/10"
        />
      </div>
    </div>
  );
}
