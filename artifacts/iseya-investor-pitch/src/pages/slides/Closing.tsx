const base = import.meta.env.BASE_URL;

export default function Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink text-bg">
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute -top-[20vh] -left-[15vh] w-[70vh] h-[70vh] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-[20vh] -right-[10vh] w-[60vh] h-[60vh] rounded-full bg-accent/15 blur-3xl" />

      <div className="absolute top-[6vh] left-[6vw] flex items-center">
        <img
          src={`${base}img/iseya-logo.png`}
          crossOrigin="anonymous"
          alt="Iṣéyá"
          className="h-[8vh] w-auto"
        />
      </div>

      <div className="absolute left-[6vw] top-[36vh] max-w-[78vw]">
        <p className="font-body text-[1.2vw] uppercase tracking-[0.4em] text-primary mb-[2vh]">
          Join us
        </p>
        <h2 className="font-display font-black text-[7vw] leading-[0.92] tracking-tight text-bg text-balance">
          Build the future
          <span className="block text-primary">of work in Nigeria.</span>
        </h2>
      </div>

      <div className="absolute bottom-[8vh] left-[6vw] right-[6vw] flex items-end justify-between">
        <div>
          <p className="font-body text-[1vw] uppercase tracking-[0.35em] text-bg/55">Contact</p>
          <p className="font-display font-bold text-[1.8vw] text-bg mt-[1vh]">hello@iseya.ng</p>
          <p className="font-body text-[1.15vw] text-bg/70 mt-[0.6vh]">iseya.ng &middot; Lagos, Nigeria</p>
        </div>
        <div className="text-right">
          <p className="font-body text-[1vw] uppercase tracking-[0.35em] text-primary">Confidential</p>
          <p className="font-body text-[1.1vw] text-bg/60 mt-[0.6vh]">
            Investor pitch &middot; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
