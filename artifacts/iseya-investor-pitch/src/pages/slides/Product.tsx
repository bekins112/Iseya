const base = import.meta.env.BASE_URL;

export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute top-0 left-0 h-[1.2vh] w-full bg-primary" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="font-body text-[1vw] uppercase tracking-[0.4em] text-muted">
          03 &middot; The Product
        </span>
        <span className="font-display font-bold text-[1.2vw] tracking-tight">Iṣéyá</span>
      </div>

      <div className="absolute left-[6vw] top-[14vh] max-w-[58vw]">
        <h2 className="font-display font-black text-[4.4vw] leading-[0.95] tracking-tight">
          Built mobile-first,
          <span className="text-accent"> for Nigeria.</span>
        </h2>
        <p className="font-body text-[1.25vw] text-muted mt-[2vh] max-w-[50vw] leading-snug">
          Three role-based experiences &mdash; Worker, Employer and Agent &mdash; with
          verification, 3-level location filters (state, city, area) and Naira-native
          payment built in.
        </p>
      </div>

      <div className="absolute left-[6vw] bottom-[6vh] right-[6vw] grid grid-cols-4 gap-[1.4vw]">
        <div className="flex flex-col">
          <div className="bg-cream rounded-[0.8vw] overflow-hidden ring-1 ring-text/5 aspect-[16/10]">
            <img
              src={`${base}img/landing.png`}
              crossOrigin="anonymous"
              alt="Iṣéyá landing page"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="font-display font-bold text-[1.15vw] mt-[1.4vh]">Landing</p>
          <p className="font-body text-[1vw] text-muted leading-snug mt-[0.4vh]">
            Role-aware home &mdash; workers, employers and agents in one place.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="bg-cream rounded-[0.8vw] overflow-hidden ring-1 ring-text/5 aspect-[16/10]">
            <img
              src={`${base}img/browse-jobs.png`}
              crossOrigin="anonymous"
              alt="Browse jobs"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="font-display font-bold text-[1.15vw] mt-[1.4vh]">Browse Jobs</p>
          <p className="font-body text-[1vw] text-muted leading-snug mt-[0.4vh]">
            Filter by state, city, area, role and pay.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="bg-cream rounded-[0.8vw] overflow-hidden ring-1 ring-text/5 aspect-[16/10]">
            <img
              src={`${base}img/employer-dashboard.png`}
              crossOrigin="anonymous"
              alt="Employer dashboard"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="font-display font-bold text-[1.15vw] mt-[1.4vh]">Employer Hub</p>
          <p className="font-body text-[1vw] text-muted leading-snug mt-[0.4vh]">
            Post roles, manage applicants, schedule interviews.
          </p>
        </div>
        <div className="flex flex-col">
          <div className="bg-cream rounded-[0.8vw] overflow-hidden ring-1 ring-text/5 aspect-[16/10]">
            <img
              src={`${base}img/applicants-inbox.png`}
              crossOrigin="anonymous"
              alt="Applicants inbox"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="font-display font-bold text-[1.15vw] mt-[1.4vh]">Applicants Inbox</p>
          <p className="font-body text-[1vw] text-muted leading-snug mt-[0.4vh]">
            Verified candidates with reviews and references.
          </p>
        </div>
      </div>
    </div>
  );
}
