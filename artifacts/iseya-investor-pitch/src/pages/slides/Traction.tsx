const base = import.meta.env.BASE_URL;

export default function Traction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          06 &middot; What&rsquo;s Already Built
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[48vw]">
        <h2 className="font-display font-black text-[4vw] leading-[0.95] tracking-tight">
          A platform &mdash;
          <span className="text-accent"> not a pitch deck.</span>
        </h2>
        <p className="font-body text-[1.2vw] text-muted mt-[2vh] leading-snug max-w-[44vw]">
          Iṣéyá is shipped, in production, and engineered for scale. Every system below
          is live today.
        </p>

        <div className="mt-[4vh] grid grid-cols-2 gap-x-[2vw] gap-y-[1.8vh]">
          <div>
            <p className="font-display font-bold text-[1.3vw]">Verification system</p>
            <p className="font-body text-[1vw] text-muted leading-snug">ID checks, photo, references, badges.</p>
          </div>
          <div>
            <p className="font-display font-bold text-[1.3vw]">Admin &amp; sub-admin RBAC</p>
            <p className="font-body text-[1vw] text-muted leading-snug">Granular permissions, activity logs.</p>
          </div>
          <div>
            <p className="font-display font-bold text-[1.3vw]">Automated email</p>
            <p className="font-body text-[1vw] text-muted leading-snug">Resend + Mailjet for transactional flows.</p>
          </div>
          <div>
            <p className="font-display font-bold text-[1.3vw]">Facebook auto-posting</p>
            <p className="font-body text-[1vw] text-muted leading-snug">Premium employer jobs syndicate to Pages.</p>
          </div>
          <div>
            <p className="font-display font-bold text-[1.3vw]">Ticketing &amp; support</p>
            <p className="font-body text-[1vw] text-muted leading-snug">In-app, with inbound email integration.</p>
          </div>
          <div>
            <p className="font-display font-bold text-[1.3vw]">NDPR-compliant</p>
            <p className="font-body text-[1vw] text-muted leading-snug">Legal pages, consent and audit trail.</p>
          </div>
        </div>
      </div>

      <div className="absolute right-[6vw] top-[16vh] w-[34vw] h-[68vh] flex items-center justify-center">
        <img
          src={`${base}img/applicant-dashboard.png`}
          crossOrigin="anonymous"
          alt="Applicant dashboard"
          className="max-h-full max-w-full rounded-[0.8vw] shadow-2xl ring-1 ring-text/10 object-contain"
        />
      </div>
    </div>
  );
}
