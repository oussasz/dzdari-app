import { IconType } from "react-icons";
import {
  MdNightlight,
  MdCalendarMonth,
  MdDateRange,
  MdAccessTime,
  MdBeachAccess,
  MdBusinessCenter,
  MdFamilyRestroom,
  MdSchool,
  MdFavorite,
  MdCelebration,
  MdWaves,
  MdCabin,
  MdLocalAirport,
  MdLocationCity,
  MdLocalParking,
  MdWifi,
  MdAcUnit,
  MdSmokeFree,
  MdSmokingRooms,
  MdPets,
  MdSecurity,
  MdAccessible,
} from "react-icons/md";
import { FaUniversity } from "react-icons/fa";

// ============================================
// DURATION CATEGORIES (Rental Period)
// ============================================
export const durationCategories = [
  {
    id: "byNight",
    label: "By Night",
    icon: MdNightlight,
    description: "Short stay - rent by the night",
  },
  {
    id: "perWeek",
    label: "Per Week",
    icon: MdDateRange,
    description: "Weekly rental - 7 days minimum",
  },
  {
    id: "perMonth",
    label: "Per Month",
    icon: MdCalendarMonth,
    description: "Monthly rental - medium term stay",
  },
  {
    id: "per3Months",
    label: "3 Months",
    icon: MdCalendarMonth,
    description: "Quarterly rental - 3 months",
  },
  {
    id: "perYear",
    label: "1 Year",
    icon: MdAccessTime,
    description: "Yearly rental - 12 months",
  },
  {
    id: "longTerm",
    label: "Long Term",
    icon: MdAccessTime,
    description: "Long duration rental (+3 months)",
  },
];

// ============================================
// PURPOSE CATEGORIES (Who is it for?)
// ============================================
export const purposeCategories = [
  {
    id: "tourism",
    label: "Tourism",
    icon: MdBeachAccess,
    description: "Perfect for tourists and travelers",
  },
  {
    id: "business",
    label: "Business",
    icon: MdBusinessCenter,
    description: "Ideal for business travelers",
  },
  {
    id: "families",
    label: "Families",
    icon: MdFamilyRestroom,
    description: "Family-friendly accommodation",
  },
  {
    id: "students",
    label: "Students",
    icon: MdSchool,
    description: "Suitable for students",
  },
  {
    id: "couples",
    label: "Couples",
    icon: MdFavorite,
    description: "Romantic getaway for couples",
  },
  {
    id: "events",
    label: "Events",
    icon: MdCelebration,
    description: "For occasions: photo shoots, engagements, birthdays...",
  },
];

// ============================================
// FEATURE CATEGORIES (Property Features)
// ============================================
export const featureCategories = [
  {
    id: "nearBeach",
    label: "Near Beach",
    icon: MdWaves,
    description: "Close to the sea",
  },
  {
    id: "countryside",
    label: "Countryside",
    icon: MdCabin,
    description: "Rural country house",
  },
  {
    id: "nearAirport",
    label: "Near Airport",
    icon: MdLocalAirport,
    description: "Close to the airport",
  },
  {
    id: "nearUniversity",
    label: "Near University",
    icon: FaUniversity,
    description: "Close to university",
  },
  {
    id: "downtown",
    label: "Downtown",
    icon: MdLocationCity,
    description: "City center location",
  },
  {
    id: "parking",
    label: "Parking",
    icon: MdLocalParking,
    description: "Parking available",
  },
  {
    id: "fastWifi",
    label: "Fast WiFi",
    icon: MdWifi,
    description: "Strong WiFi connection",
  },
  {
    id: "airConditioning",
    label: "Air Conditioning",
    icon: MdAcUnit,
    description: "Air conditioning available",
  },
  {
    id: "smokingAllowed",
    label: "Smoking Allowed",
    icon: MdSmokingRooms,
    description: "Smoking is permitted",
  },
  {
    id: "noSmoking",
    label: "No Smoking",
    icon: MdSmokeFree,
    description: "Smoke-free property",
  },
  {
    id: "petsAllowed",
    label: "Pets Allowed",
    icon: MdPets,
    description: "Pet-friendly property",
  },
  {
    id: "security",
    label: "Security",
    icon: MdSecurity,
    description: "Security cameras / guarded",
  },
  {
    id: "accessible",
    label: "Accessible",
    icon: MdAccessible,
    description: "Suitable for people with disabilities",
  },
];

// ============================================
// COMBINED CATEGORIES (for backward compatibility)
// These are shown in the main category bar
// ============================================
export const categories = purposeCategories;

// ============================================
// TYPE DEFINITIONS
// ============================================
export interface CategoryItem {
  id: string;
  label: string;
  icon: IconType;
  description: string;
}

export const LISTINGS_BATCH = 16;

export const menuItems = [
  {
    label: "My trips",
    path: "/trips",
  },
  {
    label: "My favorites",
    path: "/favorites",
  },
  {
    label: "My reservations",
    path: "/reservations",
  },
  {
    label: "My properties",
    path: "/properties",
  },
];
