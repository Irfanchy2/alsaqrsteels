import { requireAdmin } from "@/lib/admin";
import { Card, Flash, PageTitle } from "@/components/admin/AdminUI";
import { readMotion, type MotionSettings } from "@/lib/content/pages";
import SetupNotice from "@/components/admin/SetupNotice";
import Switch from "@/components/admin/Switch";
import SpeedSlider from "@/components/admin/SpeedSlider";
import { saveMotion } from "../../actions";

const EFFECTS: { key: keyof MotionSettings; label: string; hint: string }[] = [
  { key: "cursor", label: "Welding cursor", hint: "The mouse pointer becomes an electrode holder (computers only)." },
  { key: "sparks", label: "Click sparks", hint: "A burst of welding sparks wherever a visitor clicks." },
  { key: "trail", label: "Ember trail", hint: "Glowing embers follow the welding cursor as it moves." },
  { key: "heroSparks", label: "Hero sparks", hint: "Sparks rising over the big photo at the top of the home page." },
  { key: "ticker", label: "Moving strips", hint: "The scrolling services strip and client logo strip." },
  { key: "reveals", label: "Scroll animations", hint: "Sections and photos animate in as the visitor scrolls." },
  { key: "scrollFx", label: "Scroll effects", hint: "Parallax depth on big photos, hero fade-out, word-by-word headings and the “Scroll” cue." },
  { key: "tilt", label: "3D card tilt", hint: "Photo cards tilt towards the mouse on hover." },
  { key: "headingSpark", label: "Heading spark line", hint: "A spark runs along the line under each section heading." },
];

export default async function MotionPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data, error: loadError } = await supabase.from("site_content").select("data").eq("key", "motion").maybeSingle();
  const m = readMotion((data?.data as Partial<MotionSettings> | undefined) ?? null);

  return (
    <>
      <PageTitle title="Motion & effects" />
      <Flash saved={saved} error={error} />
      {loadError ? <SetupNotice /> : null}
      <form action={saveMotion} className="max-w-3xl space-y-6 pb-10">
        <Card className="space-y-5">
          <Switch
            name="enabled"
            defaultChecked={m.enabled}
            label="Animations on the website"
            hint="Turn off to make the whole site still: no movement, fades or effects. Visitors who ask their device to reduce motion never see animations either way."
          />
          <SpeedSlider defaultValue={m.speed} />
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Effects</h2>
          <p className="mt-1 text-sm text-steel-text">Each effect can be switched on or off on its own.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {EFFECTS.map((e) => (
              <Switch key={e.key} name={e.key} defaultChecked={Boolean(m[e.key])} label={e.label} hint={e.hint} />
            ))}
          </div>
        </Card>
        <button className="btn btn-primary">Save motion settings</button>
      </form>
    </>
  );
}
