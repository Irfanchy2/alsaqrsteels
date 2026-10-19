import type { IllustrationKey } from "./types";

// What we fabricate to order, grouped by discipline. These describe the kinds
// of steel and metal work the workshop builds from drawings — they are
// capabilities, not claims of specific completed client projects. Each item
// links through to the core service it belongs to and pre-fills a quote.
//
// Deliberately NOT listed, because they would overstate the workshop beyond
// what the current company information supports: CNC machining/milling/turning
// (as distinct from CNC cutting/profiling, which is offered), and any
// certification wording such as "DNV certified". Items for onshore/offshore
// use are described as fabrication for that environment, without a cert claim.

export type Capability = {
  slug: string;
  name: string;
  blurb: string;
  illustration: IllustrationKey;
  service: string; // related core service slug, for "related projects" + quote
};

export type CapabilityCategory = {
  slug: string;
  code: string; // two-letter shop-drawing style code
  title: string;
  lede: string;
  items: Capability[];
};

export const capabilityCategories: CapabilityCategory[] = [
  {
    slug: "structural-steel",
    code: "ST",
    title: "Structural Steel Fabrication",
    lede: "Primary and secondary steelwork fabricated from drawings and erected on site.",
    items: [
      { slug: "industrial-steel-sheds", name: "Industrial Steel Sheds", blurb: "Clear-span sheds and workshop buildings in structural steel.", illustration: "canopy", service: "steel-structures" },
      { slug: "steel-warehouses", name: "Steel Warehouses", blurb: "Portal-frame warehouse structures with purlins and bracing.", illustration: "ibeam", service: "steel-structures" },
      { slug: "structural-frameworks", name: "Structural Frameworks", blurb: "Columns, beams and trusses for buildings and plant structures.", illustration: "ibeam", service: "steel-structures" },
      { slug: "mezzanine-floors", name: "Mezzanine Floors", blurb: "Steel mezzanine and intermediate floor structures with decking.", illustration: "ibeam", service: "steel-structures" },
      { slug: "industrial-platforms", name: "Industrial Platforms", blurb: "Access and equipment platforms with grating and handrails.", illustration: "stair", service: "steel-structures" },
      { slug: "steel-staircases", name: "Steel Staircases", blurb: "Internal and external staircases with stringers and treads.", illustration: "stair", service: "steel-structures" },
      { slug: "access-ladders", name: "Access & Cat Ladders", blurb: "Vertical access ladders, with safety cages where required.", illustration: "stair", service: "steel-structures" },
      { slug: "crane-girders-monorails", name: "Crane Girders & Monorails", blurb: "Runway girders and monorail beams for lifting.", illustration: "ibeam", service: "steel-structures" },
      { slug: "pipe-racks", name: "Structural Pipe Racks", blurb: "Multi-tier pipe rack structures and equipment supports.", illustration: "pipe", service: "pipeline-welding" },
      { slug: "steel-skids", name: "Steel Skids & Support Frames", blurb: "Equipment skids and heavy-duty support frames.", illustration: "ibeam", service: "steel-structures" },
      { slug: "steel-canopies", name: "Steel Canopies", blurb: "Entrance, walkway and equipment canopy frames.", illustration: "canopy", service: "steel-structures" },
      { slug: "walkways-gangways", name: "Walkways & Gangways", blurb: "Access walkways and gangways with grated decking.", illustration: "stair", service: "steel-structures" },
    ],
  },
  {
    slug: "architectural-metal",
    code: "AM",
    title: "Architectural Metal Works",
    lede: "Gates, fencing, railings and decorative metalwork for sites and buildings.",
    items: [
      { slug: "steel-sliding-gates", name: "Sliding & Swing Gates", blurb: "Sliding and swing gates in steel, to opening size.", illustration: "gate", service: "steel-structures" },
      { slug: "decorative-metal-gates", name: "Decorative Metal Gates", blurb: "Patterned and custom-profile gates.", illustration: "gate", service: "steel-structures" },
      { slug: "boundary-fencing", name: "Boundary & Security Fencing", blurb: "Perimeter fencing and security barriers.", illustration: "gate", service: "steel-structures" },
      { slug: "steel-railings", name: "Steel Railings", blurb: "Balcony, staircase and edge-protection railings.", illustration: "rail", service: "steel-structures" },
      { slug: "handrails", name: "Handrails", blurb: "Staircase and walkway handrails to standard heights.", illustration: "rail", service: "steel-structures" },
      { slug: "metal-grills-screens", name: "Grills & CNC Screens", blurb: "Metal grills and CNC-cut decorative screens.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "steel-doors-frames", name: "Steel Doors & Frames", blurb: "Steel door leaves, frames and partitions.", illustration: "gate", service: "steel-structures" },
    ],
  },
  {
    slug: "cnc-cutting",
    code: "CN",
    title: "CNC Cutting & Profiling",
    lede: "Plate and sheet cut to drawing on CNC equipment, feeding straight into fabrication.",
    items: [
      { slug: "cnc-laser-cutting", name: "CNC Laser Cutting", blurb: "Precision laser cutting of sheet and plate.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "cnc-waterjet-cutting", name: "CNC Water Jet Cutting", blurb: "Water jet profiling of plate and thick sections.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "cnc-oxyfuel-cutting", name: "CNC Oxy-Fuel Cutting", blurb: "Oxy-fuel profiling of heavy plate.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "plate-profiling", name: "Steel Plate Profiling", blurb: "Base plates, gussets and brackets cut to shape.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "sheet-perforation", name: "Sheet Perforation", blurb: "Perforated and patterned sheet metal.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "decorative-panels", name: "Decorative Panel Cutting", blurb: "Decorative CNC-cut panels and façade pieces.", illustration: "cnc", service: "laser-cnc-cutting" },
      { slug: "precision-components", name: "Precision Components", blurb: "Base plates, brackets and profiled components.", illustration: "cnc", service: "laser-cnc-cutting" },
    ],
  },
  {
    slug: "stainless-steel",
    code: "SS",
    title: "Stainless Steel Fabrication",
    lede: "Stainless handrails, platforms and equipment items, finished to specification.",
    items: [
      { slug: "ss-handrails", name: "Stainless Handrails & Railings", blurb: "Stainless handrails and railings, brushed or polished.", illustration: "rail", service: "stainless-steel" },
      { slug: "ss-staircase-components", name: "Stainless Staircase Components", blurb: "Stainless stringers, treads and balustrades.", illustration: "stair", service: "stainless-steel" },
      { slug: "ss-ladders", name: "Stainless Ladders", blurb: "Stainless access ladders and cages.", illustration: "stair", service: "stainless-steel" },
      { slug: "ss-platforms", name: "Stainless Platforms & Gratings", blurb: "Stainless platforms, walkways and gratings.", illustration: "stair", service: "stainless-steel" },
      { slug: "ss-tables-frames", name: "Stainless Tables & Frames", blurb: "Stainless tables, panels and equipment frames.", illustration: "ibeam", service: "stainless-steel" },
      { slug: "ss-pipe-supports", name: "Stainless Pipe Supports", blurb: "Stainless supports, brackets and hangers.", illustration: "pipe", service: "stainless-steel" },
    ],
  },
  {
    slug: "piping-welding",
    code: "PL",
    title: "Industrial Piping & Welding",
    lede: "Pipe fabrication, supports and welding for industrial and oil & gas work.",
    items: [
      { slug: "pipeline-welding", name: "Pipeline Welding", blurb: "Welding of pipeline spools and components.", illustration: "pipe", service: "pipeline-welding" },
      { slug: "pipe-fabrication", name: "Steel Pipe Fabrication", blurb: "Pipe spools fabricated from drawings.", illustration: "pipe", service: "pipeline-welding" },
      { slug: "pipe-supports-hangers", name: "Pipe Supports & Hangers", blurb: "Supports, clamps, hangers and brackets.", illustration: "pipe", service: "pipeline-welding" },
      { slug: "site-welding", name: "Site & Structural Welding", blurb: "On-site welding and structural assembly.", illustration: "ibeam", service: "pipeline-welding" },
    ],
  },
  {
    slug: "roofing-sheds",
    code: "RF",
    title: "Roofing, Sheds & Canopies",
    lede: "Roof structures, parking sheds and cladding support steelwork.",
    items: [
      { slug: "parking-sheds", name: "Parking Sheds & Canopies", blurb: "Steel parking canopy and shade structures.", illustration: "canopy", service: "steel-structures" },
      { slug: "sandwich-panel-roofing", name: "Sandwich Panel Roofing", blurb: "Roof frames for insulated sandwich-panel cladding.", illustration: "canopy", service: "steel-structures" },
      { slug: "sandwich-panel-rooms", name: "Sandwich Panel Rooms", blurb: "Insulated panel rooms and site cabins on steel frames.", illustration: "canopy", service: "steel-structures" },
      { slug: "roof-frames-extensions", name: "Roof Frames & Extensions", blurb: "Steel roof frames and extension structures.", illustration: "ibeam", service: "steel-structures" },
      { slug: "gutters-drainage", name: "Gutters & Roof Drainage", blurb: "Roof drainage, gutters and flashing in metal.", illustration: "canopy", service: "steel-structures" },
    ],
  },
  {
    slug: "tanks-containers",
    code: "TK",
    title: "Tanks, Containers & Industrial",
    lede: "Storage, containment and handling steelwork for industrial sites.",
    items: [
      { slug: "storage-fuel-tanks", name: "Storage & Fuel Tanks", blurb: "Fabricated storage and fuel tanks.", illustration: "tank", service: "storage-containers" },
      { slug: "cement-silos", name: "Cement Silos", blurb: "Silos and hoppers for bulk material.", illustration: "tank", service: "storage-containers" },
      { slug: "storage-containers", name: "Steel Storage Containers", blurb: "Containers, skips and tube tanks.", illustration: "tank", service: "storage-containers" },
      { slug: "industrial-skids", name: "Industrial Skids", blurb: "Equipment skids and modular support frames.", illustration: "ibeam", service: "storage-containers" },
      { slug: "lifting-material-baskets", name: "Lifting & Material Baskets", blurb: "Material and lifting baskets for site handling.", illustration: "tank", service: "storage-containers" },
      { slug: "access-maintenance-platforms", name: "Access & Maintenance Platforms", blurb: "Industrial access and maintenance platforms.", illustration: "stair", service: "steel-structures" },
    ],
  },
  {
    slug: "safety-access",
    code: "SA",
    title: "Safety & Access Systems",
    lede: "Guarding, barriers and access steelwork that keeps sites safe.",
    items: [
      { slug: "safety-guard-railings", name: "Safety & Guard Railings", blurb: "Edge-protection and machine guard railings.", illustration: "rail", service: "steel-structures" },
      { slug: "road-safety-bollards", name: "Road Safety Bollards", blurb: "Fixed and protective steel bollards.", illustration: "rail", service: "steel-structures" },
      { slug: "industrial-fencing", name: "Industrial Fencing", blurb: "Mesh and panel fencing for industrial sites.", illustration: "gate", service: "steel-structures" },
      { slug: "loading-access-ramps", name: "Loading & Access Ramps", blurb: "Heavy-duty ramps for loading and access.", illustration: "ibeam", service: "steel-structures" },
      { slug: "grating-platforms", name: "Grating Platforms", blurb: "Steel grating platforms and walkways.", illustration: "stair", service: "steel-structures" },
      { slug: "machine-protection-barriers", name: "Machine Protection Barriers", blurb: "Barriers and guarding around machinery.", illustration: "rail", service: "steel-structures" },
    ],
  },
];

export const capabilities: Capability[] = capabilityCategories.flatMap((c) => c.items);
