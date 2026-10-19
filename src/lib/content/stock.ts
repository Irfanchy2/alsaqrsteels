import type { ImageRef, Project, Service } from "./types";

// Royalty-free photography (Unsplash licence, free for commercial use) used
// across the site design and as a stand-in wherever the CMS has no photo yet.
// Anything uploaded through the CMS always takes priority over these.
// Sources are listed in public/images/stock/CREDITS.md.
const photo = (file: string, alt: string, width = 2000, height = 1333): ImageRef => ({
  src: `/images/stock/${file}.jpg`,
  alt,
  width,
  height,
});

export const STOCK = {
  heroWelding: photo("hero-welding", "Welder at work with sparks flying from the weld"),
  weldingBlue: photo("welding-blue", "Welder in a protective helmet working on steel"),
  weldingSparks: photo("welding-sparks", "Sparks flying from a weld in a fabrication workshop"),
  steelErection: photo("steel-erection", "Steel erector working on a structural frame at sunset"),
  steelRoofFrame: photo("steel-roof-frame", "Steel roof trusses being installed on a building frame"),
  steelGrid: photo("steel-grid", "Structural steel frame of a building under construction"),
  pipelineValves: photo("pipeline-valves", "Industrial pipeline with valves and flanges"),
  pipeNetwork: photo("pipe-network", "Network of industrial process pipework"),
  gasFlare: photo("gas-flare-desert", "Gas flare stack at an oil and gas facility in the desert"),
  laserCutter: photo("laser-cutter", "Industrial laser cutter working on a steel sheet"),
  cncSparks: photo("cnc-sparks", "CNC profile cutting machine sending out sparks"),
  stainlessPlant: photo("stainless-plant", "Stainless steel process equipment and pipework"),
  containerYard: photo("container-yard", "Crane over stacked steel containers in a yard"),
  steelMill: photo("steel-mill", "Hot steel being worked inside a steel mill"),
  factoryHall: photo("factory-hall", "Interior of a large steel fabrication hall"),
  grinderSparks: photo("grinder-sparks", "Angle grinder throwing sparks off a steel section"),
  grindingWorker: photo("grinding-worker", "Fabricator grinding steel with sparks in the workshop"),
  cranesDusk: photo("cranes-dusk", "Tower cranes over a construction site at dusk"),
} as const;

const SERVICE_PHOTO: Record<string, ImageRef> = {
  "steel-structures": STOCK.steelRoofFrame,
  "pipeline-welding": STOCK.pipelineValves,
  "laser-cnc-cutting": STOCK.laserCutter,
  "storage-containers": STOCK.containerYard,
  "stainless-steel": STOCK.stainlessPlant,
};

// Several per sector, so neighbouring cards in one sector differ.
const SECTOR_PHOTOS: Record<string, ImageRef[]> = {
  "Oil & gas": [STOCK.gasFlare, STOCK.pipeNetwork, STOCK.pipelineValves],
  Infrastructure: [STOCK.cranesDusk, STOCK.steelGrid, STOCK.steelErection],
  Industrial: [STOCK.factoryHall, STOCK.steelMill, STOCK.weldingSparks],
  "Residential & commercial": [STOCK.steelRoofFrame, STOCK.steelGrid, STOCK.cranesDusk],
};

const ROTATION = [STOCK.steelGrid, STOCK.weldingSparks, STOCK.pipeNetwork, STOCK.steelMill, STOCK.cncSparks, STOCK.grinderSparks];

/** Design photo for a service: a stock image chosen for its discipline. */
export function serviceStock(service: Pick<Service, "slug">, i = 0): ImageRef {
  return SERVICE_PHOTO[service.slug] ?? ROTATION[i % ROTATION.length];
}

/** The CMS photo for a service, or a stock image when none is uploaded. */
export function servicePhoto(service: Pick<Service, "slug" | "image">, i = 0): ImageRef {
  return service.image ?? serviceStock(service, i);
}

/**
 * The first CMS photo for a project, or a representative stock image.
 * `representative` is true when the photo is not of the project itself.
 */
export function projectPhoto(project: Pick<Project, "images" | "sector">, i = 0): { image: ImageRef; representative: boolean } {
  if (project.images[0]) return { image: project.images[0], representative: false };
  const pool = SECTOR_PHOTOS[project.sector] ?? ROTATION;
  return { image: pool[i % pool.length], representative: true };
}

// ---------------------------------------------------------------------------
// Project galleries. Shown for a project until its own photos are uploaded
// through the CMS; one upload replaces the whole set for that project.
const g = (slug: string, alts: string[], sizes: [number, number][]): ImageRef[] =>
  alts.map((alt, i) => ({ src: `/images/projects/${slug}-${i + 1}.jpg`, alt, width: sizes[i][0], height: sizes[i][1] }));

const PROJECT_GALLERY: Record<string, ImageRef[]> = {
  "taweelah-gas-compressor-station": g(
    "taweelah-gas-compressor-station",
    ["Process plant with red and white pipework", "Pipes and valves at a compressor facility", "Storage tanks and steel pipe racks at a plant"],
    [[1400, 875], [1400, 875], [1400, 933]]
  ),
  "al-hayl-road-improvement": g(
    "al-hayl-road-improvement",
    ["Highway interchange with steel-supported overpasses", "Road works with crews and closure signs", "Construction crew at work on a road project"],
    [[1400, 788], [1400, 1066], [1400, 933]]
  ),
  "al-raha-beach-development": g(
    "al-raha-beach-development",
    ["Waterfront building under construction", "Waterfront skyline with buildings under construction", "Crew assembling a steel frame on site"],
    [[1400, 933], [1400, 620], [1400, 933]]
  ),
  "burj-vista": g(
    "burj-vista",
    ["High-rise towers in Dubai", "Aerial view of Downtown Dubai towers", "Structural steel frame against the sky"],
    [[1400, 1050], [1400, 933], [1400, 933]]
  ),
  "ittihad-paper-mill": g(
    "ittihad-paper-mill",
    ["Steel tower framework painted yellow", "Black structural steel frame of an industrial building", "Construction workers in safety vests on site"],
    [[1400, 933], [1400, 933], [1400, 893]]
  ),
  "zirku-island-development": g(
    "zirku-island-development",
    ["Offshore oil rig serviced by a supply vessel", "Offshore construction vessel with a crane", "Offshore oil rig seen from the shore"],
    [[1400, 788], [1400, 961], [1400, 933]]
  ),
  "dmcc-cluster-car-park-extension": g(
    "dmcc-cluster-car-park-extension",
    ["Multi-storey car park ramp", "Empty concrete car park level with columns", "Steel structure seen from inside"],
    [[1400, 1050], [1400, 934], [1400, 1000]]
  ),
};

/** The project's CMS photos, or its stock gallery while none are uploaded. */
export function projectImages(project: Pick<Project, "slug" | "images">): ImageRef[] {
  return project.images.length ? project.images : PROJECT_GALLERY[project.slug] ?? [];
}

// Pixel sizes of /images/showcase/<key>-<n>.jpg, in file order.
const SHOWCASE_SIZES: Record<string, [number, number][]> = {
  canopy: [[1200, 793], [1200, 799], [1200, 846], [1200, 799]],
  fence: [[1200, 799], [1200, 800], [1200, 900], [1200, 799], [1200, 799], [1200, 799]],
  gate: [[1200, 805], [1200, 799], [1200, 799], [1200, 799], [1200, 799], [1200, 799]],
  ladder: [[1200, 799], [1200, 799], [1200, 799], [1200, 799], [1200, 799], [1200, 799]],
  pergola: [[1200, 799], [1200, 799], [1200, 900], [1200, 806], [1200, 901], [1200, 900]],
  shed: [[1200, 799], [1200, 799], [1200, 799], [1200, 795], [1200, 800], [1200, 799]],
  stair: [[1200, 736], [1200, 857], [1200, 799], [1200, 799], [1200, 799], [1200, 819]],
  sunshade: [[1200, 807], [1200, 799], [1200, 804], [1200, 799], [1200, 900], [1200, 795]],
};

const SHOWCASE_ALT: Record<string, string> = {
  stair: "Steel staircase",
  ladder: "Steel access ladder",
  shed: "Steel parking shed",
  sunshade: "Shade structure on steel posts",
  canopy: "Steel canopy",
  pergola: "Steel pergola",
  gate: "Steel gate",
  fence: "Steel fence",
};

/** Photo sets for the "made to order" showcase items (first photo is the cover). */
export const SHOWCASE_PHOTOS: Record<string, ImageRef[]> = Object.fromEntries(
  Object.entries(SHOWCASE_SIZES).map(([key, list]) => [
    key,
    list.map(([width, height], i) => ({
      src: `/images/showcase/${key}-${i + 1}.jpg`,
      alt: `${SHOWCASE_ALT[key]} ${i + 1} of ${list.length}`,
      width,
      height,
    })),
  ])
);
