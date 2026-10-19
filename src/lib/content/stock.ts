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
  "steel-structures": STOCK.steelErection,
  "pipeline-welding": STOCK.pipelineValves,
  "laser-cnc-cutting": STOCK.laserCutter,
  "storage-containers": STOCK.containerYard,
  "stainless-steel": STOCK.stainlessPlant,
};

const SECTOR_PHOTO: Record<string, ImageRef> = {
  "Oil & gas": STOCK.gasFlare,
  Infrastructure: STOCK.cranesDusk,
  Industrial: STOCK.factoryHall,
  "Residential & commercial": STOCK.steelRoofFrame,
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
  return { image: SECTOR_PHOTO[project.sector] ?? ROTATION[i % ROTATION.length], representative: true };
}
