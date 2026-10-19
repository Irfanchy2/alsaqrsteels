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
        {title}
      </H>
      {intro ? <p className="mt-5 text-lg text-steel-text max-w-[62ch]">{intro}</p> : null}
    </div>
  );
}
