import { projectRegistry } from "./projectMetadata";

export const projects = projectRegistry.map((p, idx) => ({
  id: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  title: p.title,
  category: p.category,
  location: p.location,
  status: p.status,
  year: p.status.match(/\d{4}/)?.[0] || 2022,
  area: p.area,
  size: p.area,
  image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  description: p.description || `${p.title} located in ${p.location}. Project status: ${p.status}. Total area: ${p.area}.`,
}));

export const projectCategories = [
  "All",
  "Hospitality",
  "Residential",
  "Corporate",
  "Public",
  "Educational",
  "Bunglow Landscape",
];

export const team = [
  {
    id: 1,
    name: "Elena Marquez",
    role: "Founding Principal",
    bio: "Elena founded Inscape in 2009 after a decade leading civic projects in Barcelona and New York. Her work is driven by a belief that buildings should belong to their place before they belong to their architect.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
  {
    id: 2,
    name: "David Chen",
    role: "Principal, Design",
    bio: "David leads the studio's design direction, bringing fifteen years of experience across residential and cultural projects. He is obsessed with the way light moves through a space over the course of a day.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
  {
    id: 3,
    name: "Sarah Okafor",
    role: "Principal, Urban Practice",
    bio: "Sarah heads the urban and landscape work, navigating the space between architecture, ecology, and public policy. She holds a master's in urban design from MIT.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
  {
    id: 4,
    name: "Marcus Lindqvist",
    role: "Principal, Delivery",
    bio: "Marcus oversees the technical realization of every project, from documentation to handover. A licensed architect and former contractor, he ensures design intent survives the build.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
  {
    id: 5,
    name: "Priya Nair",
    role: "Senior Associate, Interiors",
    bio: "Priya leads the interiors studio, with a background in furniture making and material research. She believes the detail is the architecture, and that a door handle can be as considered as a facade.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
  {
    id: 6,
    name: "James Whitfield",
    role: "Associate, Sustainability",
    bio: "James is the studio's sustainability lead, integrating passive strategy, embodied carbon analysis, and lifecycle thinking into every project from day one.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    linkedin: "#",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We begin by listening. Site visits, conversations, and deep research into the history, climate, and culture of the place. We don't sketch until we understand the problem.",
  },
  {
    number: "02",
    title: "Concept",
    description:
      "From the research, a clear idea emerges. We test it through hand drawings, physical models, and reference imagery, refining the core spatial move before any drafting begins.",
  },
  {
    number: "03",
    title: "Design Development",
    description:
      "The concept is tested against reality. Plans, sections, and 3D models are developed in parallel with structure, systems, and material research. Every decision is traced back to the original idea.",
  },
  {
    number: "04",
    title: "Documentation",
    description:
      "We produce rigorous, buildable documentation. Our drawings are detailed enough for a craftsman to work from, and our specifications leave room for the joy of making.",
  },
  {
    number: "05",
    title: "Build",
    description:
      "We stay on the job. Regular site visits, collaboration with builders and artisans, and a willingness to solve problems in the field ensure the design is built as intended.",
  },
  {
    number: "06",
    title: "Handover",
    description:
      "We don't disappear at handover. We walk through the finished space with the client, document the work, and remain available as the building settles into its life.",
  },
];

export const values = [
  {
    title: "Sustainability",
    description:
      "We design for the long now. Every project is assessed for embodied carbon, operational energy, and its capacity to age gracefully.",
  },
  {
    title: "Craftsmanship",
    description:
      "We believe in the hand and the eye. We collaborate with artisans and builders who care, and we detail for making, not just for drawing.",
  },
  {
    title: "Collaboration",
    description:
      "Architecture is a team sport. We work openly with clients, consultants, and contractors, sharing information and credit generously.",
  },
  {
    title: "Context-Driven",
    description:
      "We start with the place. Climate, history, and community are not constraints but the raw material of the design.",
  },
];

export const principles = [
  {
    number: "01",
    title: "Form Follows Context",
    body: "A building is not an object dropped onto a site. It is a response to the light, the slope, the prevailing wind, the history, and the life already there. We design from the outside in, letting the place shape the form before the form shapes the place.",
  },
  {
    number: "02",
    title: "Light as Material",
    body: "We treat light as the primary material of architecture, not an afterthought. How a space receives the morning sun, how shadow deepens a hallway, how a clerestory turns a wall into a luminous plane — these are the decisions that matter most.",
  },
  {
    number: "03",
    title: "Human-Centered Space",
    body: "We design for the body, not the rendering. A room is measured by how it feels to sit, to stand, to wait, to gather. Scale, proportion, and threshold are tuned to human experience, not to the camera.",
  },
  {
    number: "04",
    title: "Honest Materials",
    body: "We let materials be what they are. Wood reads as wood, concrete as concrete, steel as steel. We avoid imitation and fashion, choosing materials that patinate, weather, and gather meaning over time.",
  },
  {
    number: "05",
    title: "Sustainable Intent",
    body: "Sustainability is not a checkbox. It is a design ethic that runs from the urban scale to the detail. We build less, build well, and build for a future that will judge us on the carbon we left in the ground.",
  },
];

export const stats = [
  { value: "100+ Acres", label: "Total Area We Have Covered" },
  { value: "75+", label: "Clients" },
  { value: "25000+", label: "Trees & Shrubs Planted" },
  { value: "24", label: "Cities" },
];

export const awards = [
  { year: 2024, name: "AIA Honor Award", project: "Casa Terracotta" },
  { year: 2023, name: "Architizer A+ Award", project: "Marlowe Pavilion" },
  { year: 2023, name: "Dezeen Award, Longlisted", project: "North Square" },
  { year: 2022, name: "AIA Small Project Award", project: "Harbor House" },
  { year: 2021, name: "World Architecture Festival, Shortlisted", project: "Stillwater Retreat" },
  { year: 2020, name: "Archdaily Building of the Year", project: "Foundry Lofts" },
];

export const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Awards & Publication", path: "/awards" },
  { name: "Contact", path: "/contact" },
];
