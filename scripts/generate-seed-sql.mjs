import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";

function readJson(relativePath) {
  const filePath = new URL(relativePath, import.meta.url);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

const wilayas = readJson("../data/algeria-wilayas.json");
const communesFr = readJson("../data/algeria-communes-fr.json");

const ADMIN_NAME = "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@lugario.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin12345";

const OUT_FILE = process.env.SEED_SQL_OUT || "prisma/seed.cpanel.sql";

const TARGET_WILAYA_CODES = [
  "16",
  "31",
  "25",
  "23",
  "06",
  "15",
  "19",
  "05",
  "09",
  "42",
  "13",
  "18",
  "21",
  "27",
  "30",
  "47",
  "07",
  "35",
  "02",
  "22",
];

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
  const multiplier = 0.91 + ((idx % 9) / 100) * 2;
  return Math.round((base * multiplier) / 100) * 100;
}

function pickFeatureSet(idx) {
  const a = pickFrom(FEATURES, idx);
  const b = pickFrom(FEATURES, idx + 3);
  const c = pickFrom(FEATURES, idx + 7);
  const d = pickFrom(FEATURES, idx + 11);
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

function sqlEscape(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("'", "''");
}

function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${sqlEscape(value)}'`;
}

function sqlNum(value) {
  if (value === null || value === undefined || Number.isNaN(value))
    return "NULL";
  return String(value);
}

const now = () => "NOW()";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const selectedWilayas = TARGET_WILAYA_CODES.map((code) => {
    const w = wilayas.find((x) => x.code === code);
    if (!w) throw new Error(`Wilaya code not found in data: ${code}`);
    return w;
  });

  const statements = [];
  statements.push("-- Lugario seed (cPanel/phpMyAdmin import)");
  statements.push(
    "-- Creates/updates an admin user and 20 demo listings (marked with [seed]).",
  );
  statements.push(
    "-- Safe to re-run: deletes prior seeded listings for that admin user.",
  );
  statements.push("");

  statements.push(`SET @seed_admin_email := ${sqlStr(ADMIN_EMAIL)};`);
  statements.push("");

  statements.push(
    [
      "INSERT INTO `User` (`id`, `name`, `email`, `password`, `createdAt`, `updatedAt`)",
      `VALUES (${sqlStr("seed_admin")}, ${sqlStr(ADMIN_NAME)}, @seed_admin_email, ${sqlStr(passwordHash)}, ${now()}, ${now()})`,
      "ON DUPLICATE KEY UPDATE",
      "  `name` = VALUES(`name`),",
      "  `password` = VALUES(`password`),",
      "  `updatedAt` = VALUES(`updatedAt`);",
    ].join("\n"),
  );

  statements.push(
    "SELECT @seed_admin_id := `id` FROM `User` WHERE `email` = @seed_admin_email LIMIT 1;",
  );
  statements.push("");
  statements.push(
    "DELETE FROM `Listing` WHERE `userId` = @seed_admin_id AND `description` LIKE '%[seed]%';",
  );
  statements.push("");

  for (let idx = 0; idx < selectedWilayas.length; idx++) {
    const w = selectedWilayas[idx];
    const region = w.nameFr;
    const municipality = pickCommuneNameFr(w.code, idx + 2) || region;

    const base = BASE_PRICE_BY_WILAYA[w.code] ?? 7500;
    const price = jitterPrice(base, idx);

    const category = pickFrom(PURPOSES, idx);
    const duration = pickFrom(DURATIONS, idx + 1);
    const features = pickFeatureSet(idx).join(",");
    const imageSrc =
      CLOUDINARY_DEMO_IMAGES[idx % CLOUDINARY_DEMO_IMAGES.length];

    const roomCount = 1 + (idx % 4);
    const bathroomCount = 1 + (idx % 2);
    const guestCount = Math.min(8, roomCount * 2 + 1);

    const address = `Rue des Oliviers, ${municipality}, ${region}`;
    const title = listingTitle(region, municipality, idx);
    const description = [
      `[seed] Realistic demo listing for ${region}.`,
      `Ideal for ${category.toLowerCase()} stays.`,
      `Includes: ${features.split(",").slice(0, 3).join(", ")}.`,
      `Rental: ${duration}.`,
    ].join(" ");

    const latitude = Array.isArray(w.center) ? w.center[0] : null;
    const longitude = Array.isArray(w.center) ? w.center[1] : null;

    const listingId = `seed_listing_${w.code}`;
    statements.push(
      [
        "INSERT INTO `Listing` (",
        "  `id`, `title`, `description`, `imageSrc`, `category`, `duration`, `features`,",
        "  `roomCount`, `bathroomCount`, `guestCount`, `userId`, `price`,",
        "  `country`, `latitude`, `longitude`, `region`, `municipality`, `address`, `createdAt`",
        ") VALUES (",
        [
          sqlStr(listingId),
          sqlStr(title),
          sqlStr(description),
          sqlStr(imageSrc),
          sqlStr(category),
          sqlStr(duration),
          sqlStr(features),
          sqlNum(roomCount),
          sqlNum(bathroomCount),
          sqlNum(guestCount),
          "@seed_admin_id",
          sqlNum(price),
          sqlStr("Algeria"),
          sqlNum(latitude),
          sqlNum(longitude),
          sqlStr(region),
          sqlStr(municipality),
          sqlStr(address),
          now(),
        ].join(", "),
        ");",
      ].join("\n"),
    );
    statements.push("");
  }

  const sql = statements.join("\n");

  const outPath = path.resolve(process.cwd(), OUT_FILE);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sql, "utf8");

  // Keep stdout minimal (avoid dumping full SQL in terminals).
  console.log(`Wrote SQL seed file: ${OUT_FILE}`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
