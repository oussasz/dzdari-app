/* eslint-disable no-console */

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const wilayas = require("../data/algeria-wilayas.json");
const communesFr = require("../data/algeria-communes-fr.json");

const prisma = new PrismaClient();

const ADMIN_NAME = "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@lugario.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin12345";

// 20 popular wilayas (by tourism/business demand).
const TARGET_WILAYA_CODES = [
  "16", // Alger
  "31", // Oran
  "25", // Constantine
  "23", // Annaba
  "06", // Bejaia
  "15", // Tizi Ouzou
  "19", // Setif
  "05", // Batna
  "09", // Blida
  "42", // Tipaza
  "13", // Tlemcen
  "18", // Jijel
  "21", // Skikda
  "27", // Mostaganem
  "30", // Ouargla
  "47", // Ghardaia
  "07", // Biskra
  "35", // Boumerdes
  "02", // Chlef
  "22", // Sidi Bel Abbes
];

// Region pricing (DZD/night) tuned for realistic spread.
const BASE_PRICE_BY_WILAYA = {
  16: 12500,
  31: 10500,
  25: 9000,
  23: 9500,
  "06": 9800,
  15: 8500,
  19: 7800,
  "05": 6800,
  "09": 7200,
  42: 9200,
  13: 8800,
  18: 8200,
  21: 8000,
  27: 8400,
  30: 6200,
  47: 6800,
  "07": 5800,
  35: 9000,
  "02": 7400,
  22: 7600,
};

const PURPOSES = [
  "Tourism",
  "Business",
  "Families",
  "Students",
  "Couples",
  "Events",
];
const DURATIONS = ["By Night", "Per Week", "Per Month", "Long Term"];
const FEATURES = [
  "Near Beach",
  "Countryside",
  "Near Airport",
  "Near University",
  "Downtown",
  "Parking",
  "Fast WiFi",
  "Air Conditioning",
  "No Smoking",
  "Pets Allowed",
  "Security",
  "Accessible",
];

const CLOUDINARY_DEMO_IMAGES = [
  "https://res.cloudinary.com/demo/image/upload/v1690000000/house.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/apartment.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/lake.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/balloons.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/surf.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/mountain.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/cafe.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/bridge.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/castle.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/park.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/boat.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/road.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/skyscraper.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/interior.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/restaurant.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/beach.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/snow.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/garden.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/room.jpg",
  "https://res.cloudinary.com/demo/image/upload/v1690000000/villa.jpg",
];

function pickFrom(list, idx) {
  return list[idx % list.length];
}

function pickCommuneNameFr(wilayaCode, idx) {
  const list = communesFr[wilayaCode] || [];
  if (!list.length) return "";
  return list[idx % list.length];
}

function jitterPrice(base, idx) {
  // +/- up to ~9% deterministic jitter.
  const multiplier = 0.91 + ((idx % 9) / 100) * 2; // 0.91 -> 1.07
  return Math.round((base * multiplier) / 100) * 100; // round to 100 DZD
}

function pickFeatureSet(idx) {
  const a = pickFrom(FEATURES, idx);
  const b = pickFrom(FEATURES, idx + 3);
  const c = pickFrom(FEATURES, idx + 7);
  const d = pickFrom(FEATURES, idx + 11);
  // ensure uniqueness
  return Array.from(new Set([a, b, c, d])).slice(0, 4);
}

function listingTitle(region, municipality, idx) {
  const styles = [
    `Modern apartment in ${municipality}`,
    `Cozy studio • ${region}`,
    `Family-friendly home near ${municipality}`,
    `Bright downtown stay in ${region}`,
    `Quiet retreat in ${municipality}`,
  ];
  return pickFrom(styles, idx);
}

async function main() {
  console.log("Seeding: admin user + 20 Algeria listings...");

  try {
    await prisma.$connect();
  } catch (_err) {
    console.error(
      "Database connection failed. Please check your DATABASE_URL (host/user/password) and that the MySQL server is reachable.",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  let admin;
  try {
    admin = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      create: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
      },
      update: {
        name: ADMIN_NAME,
        password: passwordHash,
      },
    });
  } catch (_err) {
    console.error(
      "Seed failed while creating/updating the admin user. Please verify DATABASE_URL credentials and that migrations are applied.",
    );
    process.exit(1);
  }

  // Idempotency: remove only prior seeded listings for this admin.
  await prisma.listing.deleteMany({
    where: {
      userId: admin.id,
      description: { contains: "[seed]" },
    },
  });

  const selectedWilayas = TARGET_WILAYA_CODES.map((code) => {
    const w = wilayas.find((x) => x.code === code);
    if (!w) throw new Error(`Wilaya code not found in data: ${code}`);
    return w;
  });

  const listingsData = selectedWilayas.map((w, idx) => {
    const region = w.nameFr;
    const municipality = pickCommuneNameFr(w.code, idx + 2) || region;
    const base = BASE_PRICE_BY_WILAYA[w.code] ?? 7500;
    const price = jitterPrice(base, idx);
    const category = pickFrom(PURPOSES, idx);
    const duration = pickFrom(DURATIONS, idx + 1);
    const features = pickFeatureSet(idx).join(",");
    const imageSrc =
      CLOUDINARY_DEMO_IMAGES[idx % CLOUDINARY_DEMO_IMAGES.length];

    const roomCount = 1 + (idx % 4); // 1..4
    const bathroomCount = 1 + (idx % 2); // 1..2
    const guestCount = Math.min(8, roomCount * 2 + 1);

    const address = `Rue des Oliviers, ${municipality}, ${region}`;
    const title = listingTitle(region, municipality, idx);
    const description = [
      `[seed] Realistic demo listing for ${region}.`,
      `Ideal for ${category.toLowerCase()} stays.`,
      `Includes: ${features.split(",").slice(0, 3).join(", ")}.`,
      `Rental: ${duration}.`,
    ].join(" ");

    return {
      title,
      description,
      imageSrc,
      category,
      duration,
      features,
      roomCount,
      bathroomCount,
      guestCount,
      price,
      country: "Algeria",
      region,
      municipality,
      address,
      latitude: Array.isArray(w.center) ? w.center[0] : null,
      longitude: Array.isArray(w.center) ? w.center[1] : null,
      userId: admin.id,
    };
  });

  await prisma.listing.createMany({ data: listingsData });

  console.log(`Seed complete.`);
  console.log(`Admin credentials:`);
  console.log(`  email: ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log(`Created listings: ${listingsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
