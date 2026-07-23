import team1 from "@/assets/gallery-team1.jpg";
import team2 from "@/assets/gallery-team2.jpg";
import team3 from "@/assets/gallery-team3.jpg";
import team4 from "@/assets/gallery-team4.jpg";
import stitching from "@/assets/process-stitching.jpg";
import printing from "@/assets/process-printing.jpg";
import fabric from "@/assets/process-fabric.jpg";

export type GalleryItem = {
  id: string;
  image: string;
  title: string;
  category: "Schools" | "Colleges" | "Clubs" | "Corporate" | "Events" | "Factory";
  description: string;
};

export const GALLERY: GalleryItem[] = [
  { id: "g1", image: team1, title: "District School Cricket Champions", category: "Schools", description: "Custom cricket jerseys and caps for a 22-member school team." },
  { id: "g2", image: team2, title: "College Football Squad", category: "Colleges", description: "Full team kit with sublimation crest and player numbers." },
  { id: "g3", image: team3, title: "Corporate Cricket Cup", category: "Corporate", description: "Sponsor-branded jerseys for an inter-company tournament." },
  { id: "g4", image: team4, title: "Kabaddi Academy Team", category: "Clubs", description: "Lycra-blend kabaddi kits for regional academy squad." },
  { id: "g5", image: fabric, title: "Premium Fabric Sourcing", category: "Factory", description: "High-GSM performance fabric ready for cutting and sublimation." },
  { id: "g6", image: printing, title: "Digital Sublimation Printing", category: "Factory", description: "Full-color, wash-safe prints across the entire garment." },
  { id: "g7", image: stitching, title: "Precision Stitching Line", category: "Factory", description: "Skilled operators build every jersey with reinforced seams." },
];
