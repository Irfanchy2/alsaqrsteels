type Props = {
  label?: string;
  title: string;
  intro?: string;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
};

export default function SectionHeading({ label, title, intro, as = "h2", className = "", id }: Props) {
  const H = as;
  return (
    <div className={`max-w-3xl ${className}`} data-reveal>
      {label ? <p className="label">{label}</p> : null}
      <H
        id={id}
        className={`mt-4 font-bold ${as === "h1" ? "text-[2.4rem] sm:text-5xl lg:text-[3.6rem]" : "text-[1.9rem] sm:text-4xl lg:text-[2.75rem]"}`}
      >
        {/* Words rise in one after another when scroll effects are on. */}
        {title.split(/(\s+)/).map((w, i) =>
          /^\s+$/.test(w) ? w : (
            <span key={i} className="word" style={{ ["--i" as string]: Math.floor(i / 2) }}>
              {w}
            </span>
          )
        )}
      </H>
      <span className="heading-spark" aria-hidden="true" />
      {intro ? <p className="mt-5 text-lg text-steel-text max-w-[62ch]">{intro}</p> : null}
    </div>
  );
}
