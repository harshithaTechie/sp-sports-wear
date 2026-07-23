import cricket from "@/assets/product-cricket.jpg";
import football from "@/assets/product-football.jpg";
import volleyball from "@/assets/product-volleyball.jpg";
import basketball from "@/assets/product-basketball.jpg";
import kabaddi from "@/assets/product-kabaddi.jpg";
import running from "@/assets/product-running.jpg";
import cycling from "@/assets/product-cycling.jpg";
import school from "@/assets/product-school.jpg";
import college from "@/assets/product-college.jpg";
import corporate from "@/assets/product-corporate.jpg";
import event from "@/assets/product-event.jpg";
import tracksuit from "@/assets/product-tracksuit.jpg";
import shorts from "@/assets/product-shorts.jpg";
import lowers from "@/assets/product-lowers.jpg";
import sleeveless from "@/assets/product-sleeveless.jpg";
import cap from "@/assets/product-cap.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  image: string;
  description: string;
  fabric: string[];
  sizes: string[];
  colors: string[];
  moq: number;
  customization: string[];
  tag?: string;
};

export const CATEGORIES = [
  "Cricket",
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Running",
  "Cycling",
  "School",
  "College",
  "Corporate",
  "Events",
  "Tracksuits",
  "Shorts & Lowers",
  "Sleeveless",
  "Caps",
] as const;

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const defaultColors = ["Navy", "Royal Blue", "Orange", "White", "Black", "Red", "Yellow", "Custom"];
const defaultCustomization = [
  "Sublimation print",
  "Team name & numbers",
  "Sponsor logos",
  "Custom collar & sleeve",
  "Player names",
  "Team crest",
];

export const PRODUCTS: Product[] = [
  {
    slug: "cricket-jersey",
    name: "Custom Cricket Jersey",
    category: "Cricket",
    image: cricket,
    description:
      "Tournament-grade cricket jersey engineered for long innings under the sun — lightweight, quick-dry, and fully sublimation printed with your team identity.",
    fabric: ["Micro Polyester", "Honeycomb Dry-Fit", "Interlock"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 10,
    customization: defaultCustomization,
    tag: "Bestseller",
  },
  {
    slug: "football-jersey",
    name: "Custom Football Jersey",
    category: "Football",
    image: football,
    description:
      "Match-ready football kit with breathable mesh panels, athletic fit, and full-color sublimation for crests, sponsors and player numbers.",
    fabric: ["Micro Polyester", "Pique Mesh", "Sports Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 10,
    customization: defaultCustomization,
  },
  {
    slug: "volleyball-jersey",
    name: "Custom Volleyball Jersey",
    category: "Volleyball",
    image: volleyball,
    description:
      "High-mobility volleyball jersey with reinforced shoulders and moisture wicking, cut for jumps, digs and full team branding.",
    fabric: ["Micro Polyester", "Interlock", "Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 10,
    customization: defaultCustomization,
  },
  {
    slug: "basketball-jersey",
    name: "Custom Basketball Jersey",
    category: "Basketball",
    image: basketball,
    description:
      "Sleeveless basketball jersey with ventilated side panels and premium sublimation — designed for tournament wear and academy training.",
    fabric: ["Micro Mesh", "Interlock", "Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 10,
    customization: defaultCustomization,
  },
  {
    slug: "kabaddi-jersey",
    name: "Custom Kabaddi Jersey",
    category: "Kabaddi",
    image: kabaddi,
    description:
      "Tournament kabaddi kit built for contact play — stretchable, tear-resistant fabric with full-body sublimation printing.",
    fabric: ["Lycra", "Micro Polyester", "Interlock"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 10,
    customization: defaultCustomization,
  },
  {
    slug: "running-jersey",
    name: "Custom Running Jersey",
    category: "Running",
    image: running,
    description:
      "Ultra-light running jersey for marathons, events and academies — moisture wicking, breathable, with sponsor and bib-friendly layout.",
    fabric: ["Dry-Fit", "Honeycomb"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 25,
    customization: defaultCustomization,
  },
  {
    slug: "cycling-jersey",
    name: "Custom Cycling Jersey",
    category: "Cycling",
    image: cycling,
    description:
      "Aerodynamic cycling jersey with half/full zipper, back pockets and sublimation printing for professional cycling clubs.",
    fabric: ["Lycra", "Micro Polyester"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: [...defaultCustomization, "Zip length", "Back pockets"],
  },
  {
    slug: "school-uniform",
    name: "School Sports Uniform",
    category: "School",
    image: school,
    description:
      "Complete school sports set — jersey, shorts and track pants — crafted for daily wear with heavy-duty stitching and school crest customization.",
    fabric: ["PC Cotton", "Interlock", "Poly Cotton"],
    sizes: ["4-6y", "6-8y", "8-10y", "S", "M", "L", "XL"],
    colors: defaultColors,
    moq: 25,
    customization: ["School crest", "House colors", "Class labels", "Custom collar"],
    tag: "Popular",
  },
  {
    slug: "college-jersey",
    name: "College Team Jersey",
    category: "College",
    image: college,
    description:
      "Premium college jersey for department teams, fests and tournaments — bold team colors with rich sublimation branding.",
    fabric: ["Micro Polyester", "Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: defaultCustomization,
  },
  {
    slug: "corporate-jersey",
    name: "Corporate Sports Uniform",
    category: "Corporate",
    image: corporate,
    description:
      "Polished corporate sports polo & tees for company tournaments, off-sites and events. Full logo embroidery and sublimation options.",
    fabric: ["Pique", "Dry-Fit", "Micro Polyester"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: ["Embroidery", "Sublimation", "Company logo", "Employee names"],
  },
  {
    slug: "event-jersey",
    name: "Event & Tournament Jersey",
    category: "Events",
    image: event,
    description:
      "Bulk event jerseys for marathons, campaigns and tournaments — fast turnaround with your sponsors, dates and event branding.",
    fabric: ["Dry-Fit", "Micro Polyester"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 50,
    customization: defaultCustomization,
  },
  {
    slug: "tracksuit",
    name: "Custom Tracksuit Set",
    category: "Tracksuits",
    image: tracksuit,
    description:
      "Premium tracksuit — full jacket and lower — for academies, schools and clubs. Custom colors, panels, logos and player names.",
    fabric: ["N/S Lycra", "Micro Polyester", "Poly Cotton"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: [...defaultCustomization, "Zipper style", "Panel colors"],
  },
  {
    slug: "sports-shorts",
    name: "Sports Shorts",
    category: "Shorts & Lowers",
    image: shorts,
    description:
      "Athletic sports shorts with elastic waistband and quick-dry fabric — team colors, side stripes and custom prints available.",
    fabric: ["Micro Polyester", "Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: ["Side stripes", "Team logo", "Player number"],
  },
  {
    slug: "lowers",
    name: "Track Lowers",
    category: "Shorts & Lowers",
    image: lowers,
    description:
      "Comfort-fit athletic lowers with side pockets and drawstring — perfect for academies, warm-up sets and daily training.",
    fabric: ["N/S Lycra", "Poly Cotton", "Dry-Fit"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: ["Side stripes", "Ankle cuff", "Logo"],
  },
  {
    slug: "sleeveless-tshirt",
    name: "Sleeveless Training T-Shirt",
    category: "Sleeveless",
    image: sleeveless,
    description:
      "Ventilated sleeveless training tee for gym, kabaddi and athletics — lightweight, breathable, fully customizable.",
    fabric: ["Dry-Fit", "Micro Polyester"],
    sizes: defaultSizes,
    colors: defaultColors,
    moq: 15,
    customization: defaultCustomization,
  },
  {
    slug: "sports-cap",
    name: "Custom Sports Cap",
    category: "Caps",
    image: cap,
    description:
      "Structured sports cap with embroidered or printed team logos — great as an add-on for tournaments and events.",
    fabric: ["Cotton Twill", "Poly Cotton"],
    sizes: ["Free size"],
    colors: defaultColors,
    moq: 25,
    customization: ["Embroidery", "Print", "Team logo"],
  },
];

export function findProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}
