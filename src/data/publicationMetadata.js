/**
 * Publication Metadata Registry for Inscape Design Studio.
 * Matches Drive publication filenames or IDs with accurate editorial metadata.
 */

export const publicationRegistry = [
  {
    keywords: ["01", "picture1", "landscape75", "landscape 75", "issue75", "milestone"],
    title: "LANDSCAPE MAGAZINE — ISSUE 75",
    publicationName: "Landscape Magazine",
    issue: "Issue 75 • Special Milestone",
    status: "Published Feature",
    category: "Contextual Architecture",
    description: `Special Feature: Raw, Rooted and Contextual Architecture - An Integral Vision of CA.\n\nFeatured in Landscape Magazine's milestone 75th edition, highlighting Inscape's contextual architectural philosophy. The feature explores how rooted design, indigenous materials, and ecological consciousness converge to create transformative, enduring built environments.`,
  },
  {
    keywords: ["02", "picture2", "landscape74", "landscape 74", "issue74", "74"],
    title: "LANDSCAPE MAGAZINE — ISSUE 74",
    publicationName: "Journal of Landscape Architecture",
    issue: "Issue 74 • Monograph Edition",
    status: "Published Feature",
    category: "Ecological Urbanism",
    description: `Featured in Landscape Architecture Issue 74, highlighting sustainable landscape master planning and responsive site interventions.\n\nThe feature explores contextual design frameworks and regenerative planting strategies that honor local microclimates and environmental harmony.`,
  },
  {
    keywords: ["03", "picture3", "glitz", "neptune", "county"],
    title: "GLITZ ARCHITECTURE & INTERIORS",
    publicationName: "The Neptune Glitz",
    issue: "Architecture & Interior Annual",
    status: "Published Feature",
    category: "Hospitality & Landscape",
    description: `A celebrated feature in GLITZ Architecture & Interiors spotlighting Inscape's visionary landscape interventions and modern hospitality projects.\n\nThe feature highlights our approach to integrating natural terrain, water bodies, and contextual materiality to create evocative spaces where visitors seamlessly reconnect with natural surroundings.`,
  },
  {
    keywords: ["04", "picture4", "approbation", "iia", "volume 85"],
    title: "APPROBATION",
    publicationName: "Journal of the Indian Institute of Architects",
    issue: "Volume 85 • Issue 03",
    status: "Published Feature",
    category: "Architectural Discourse",
    description: `Featured in Approbation by the Indian Institute of Architects (IIA), celebrating contextual design sensitivity and sustainable architectural philosophies.\n\nThe article examines Inscape's commitment to climate-responsive design, tactile craft, and modern vernacular aesthetics that respect local culture and indigenous ecosystems.`,
  },
  {
    keywords: ["05", "picture5", "landscape & memory", "landscape and memory", "issue 37", "memory", "37"],
    title: "JOURNAL OF LANDSCAPE ARCHITECTURE",
    publicationName: "Landscape & Memory",
    issue: "Issue 37 • Monograph Series",
    status: "Published Feature",
    category: "Landscape Urbanism",
    description: `Published in the prestigious Journal of Landscape Architecture's 'Landscape & Memory' edition, exploring collective memory and physical geography.\n\nThe narrative dissects Inscape's restorative landscape methodologies—transforming forgotten parcels into living, regenerative ecological corridors filled with indigenous flora and enduring craftsmanship.`,
  },
  {
    keywords: ["06", "headline_06", "headline", "picture6", "awards", "design awards"],
    title: "THE NEPTUNE GLITZ — DESIGN AWARDS",
    publicationName: "Glitz Architecture & Design",
    issue: "Special Honours Edition",
    status: "Published Feature",
    category: "Design Excellence",
    description: `An exclusive editorial commemorating Inscape's design recognitions and innovative architectural practices across eastern India.\n\nFrom luxury resort masters to intimate residential landscapes, the profile underscores our relentless pursuit of harmony between the built environment and living nature.`,
  },
];

export function getPublicationMetadata(identifier, index) {
  const clean = String(identifier || "").toLowerCase().trim();

  if (clean) {
    const found = publicationRegistry.find((item) =>
      item.keywords.some((kw) => clean === kw || clean.includes(kw))
    );
    if (found) return found;
  }

  // Check if identifier is a numeric string (e.g. "04" -> index 3, "01" -> index 0)
  const numericMatch = clean.match(/^\d+$/);
  if (numericMatch) {
    const num = parseInt(numericMatch[0], 10);
    if (num >= 1 && num <= publicationRegistry.length) {
      return publicationRegistry[num - 1];
    }
  }

  if (typeof index === "number" && index >= 0 && index < publicationRegistry.length) {
    return publicationRegistry[index];
  }

  return {
    title: String(identifier).replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "").toUpperCase(),
    publicationName: "Featured Publication",
    issue: "Selected Feature",
    status: "Published Feature",
    category: "Architecture & Landscape",
    description: `Featured publication celebrating Inscape Design Studio's commitment to contextual architecture, environmental sensitivity, and sustainable landscape practice.\n\nOur studio continues to bridge ecological intelligence and architectural craft across residential, hospitality, and civic spaces.`,
  };
}

