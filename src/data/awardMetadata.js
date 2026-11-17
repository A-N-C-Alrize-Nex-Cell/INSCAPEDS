/**
 * Award Metadata Registry for Inscape Design Studio.
 * Matches Drive award filenames, folder names, or IDs with editorial metadata.
 */

export const awardRegistry = [
  {
    keywords: ["01", "hudco", "hudco design awards", "second prize", "2023-24", "2023", "2024"],
    title: "HUDCO DESIGN AWARDS",
    awardName: "HUDCO Design Awards — Second Prize",
    year: "2023–24",
    project: "Landscape Planning & Design",
    category: "Public & Ecological Landscape",
    status: "Second Prize Winner",
    description: `Second prize awarded to Ar. Sujoy Das (Inscape Design Studio) at the HUDCO Design Awards for excellence in Landscape Planning and Design.\n\nThe project demonstrates context-responsive ecological stewardship, integrating native biodiversity, water conservation, and accessible public spaces that enrich communities.`,
  },
  {
    keywords: ["02", "isola", "isola design excellence", "national award", "2022"],
    title: "ISOLA DESIGN EXCELLENCE AWARD",
    awardName: "ISOLA National Award Commendation",
    year: "2022",
    project: "Public Landscape Design",
    category: "Landscape Architecture",
    status: "National Commendation",
    description: `Winner of the prestigious ISOLA Design excellence National award commendation in Public Landscape Design by the Indian Society of Landscape Architects in 2022.\n\nRecognizing groundbreaking architectural and ecological interventions that celebrate local cultural context, tactile materiality, and sustainable flora ecosystems.`,
  },
  {
    keywords: ["03", "iia", "indian institute of architects", "excellence in architecture", "2023"],
    title: "IIA NATIONAL AWARD FOR EXCELLENCE",
    awardName: "Indian Institute of Architects National Award",
    year: "2023",
    project: "Landscape Projects",
    category: "Contextual Architecture",
    status: "National Winner",
    description: `National Award winner for excellence in architecture in Landscape Projects by the Indian Institute of Architects (IIA) in 2023.\n\nA celebration of enduring craft, climate-responsive sensibilities, and human-nature harmony in built environments.`,
  },
  {
    keywords: ["04", "aia", "aia honor", "casa terracotta", "honor award"],
    title: "AIA HONOR AWARD",
    awardName: "AIA Honor Award",
    year: "2024",
    project: "Casa Terracotta",
    category: "Residential Architecture",
    status: "Honor Award Winner",
    description: `Celebrated with the AIA Honor Award for Casa Terracotta, recognizing residential landscape design that merges earthen materiality with ecological sensitivity.\n\nThe project reflects Inscape's philosophy of tactile architecture rooted intimately in its natural context.`,
  },
  {
    keywords: ["05", "architizer", "marlowe", "marlowe pavilion", "a+ award"],
    title: "ARCHITIZER A+ AWARD",
    awardName: "Architizer A+ Award — Special Mention",
    year: "2023",
    project: "Marlowe Pavilion",
    category: "Pavilion & Public Space",
    status: "Special Mention",
    description: `Honored at the global Architizer A+ Awards for Marlowe Pavilion, a lightweight contextual pavilion celebrating timber craftsmanship and open landscape vistas.\n\nThe project bridges the boundary between sheltered architecture and the surrounding living landscape.`,
  },
  {
    keywords: ["06", "dezeen", "north square", "longlisted"],
    title: "DEZEEN AWARDS",
    awardName: "Dezeen Award — Longlisted",
    year: "2023",
    project: "North Square",
    category: "Urban Landscape",
    status: "Longlisted",
    description: `Longlisted in the prestigious Dezeen Awards for North Square, an urban public landscape revitalizing community engagement through climate-resilient softscaping.\n\nThe design demonstrates our commitment to restorative public realm interventions across rapidly developing urban centers.`,
  },
];

export function getAwardMetadata(identifier, index) {
  const clean = String(identifier || "").toLowerCase().trim();

  if (clean) {
    const found = awardRegistry.find((item) =>
      item.keywords.some((kw) => clean === kw || clean.includes(kw))
    );
    if (found) return found;
  }

  // Check if identifier is a numeric string (e.g. "01" -> index 0, "02" -> index 1)
  const numericMatch = clean.match(/^\d+$/);
  if (numericMatch) {
    const num = parseInt(numericMatch[0], 10);
    if (num >= 1 && num <= awardRegistry.length) {
      return awardRegistry[num - 1];
    }
  }

  if (typeof index === "number" && index >= 0 && index < awardRegistry.length) {
    return awardRegistry[index];
  }

  return {
    title: String(identifier).replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "").toUpperCase(),
    awardName: "Honors and Awards",
    year: "Selected Honor",
    project: "Contextual Architecture & Landscape",
    category: "Design Excellence",
    status: "Awarded",
    description: `Recognized for excellence in contextual landscape planning, architectural craft, and sustainable environmental practice.\n\nInscape Design Studio continues to produce context-responsive designs that celebrate the relationship between people and natural ecosystems.`,
  };
}
