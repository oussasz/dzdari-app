"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LISTINGS_BATCH } from "@/utils/constants";
import { getCurrentUser } from "./user";

export const getListings = async (query?: {
  [key: string]: string | string[] | undefined | null;
}) => {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      country,
      region,
      municipality,
      startDate,
      endDate,
      category,
      duration,
      feature,
      cursor,
    } = query || {};

    let where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      where.category = { in: categories };
    }

    if (duration) {
      const durations = Array.isArray(duration) ? duration : [duration];
      where.duration = { in: durations };
    }

    if (feature) {
      const features = Array.isArray(feature) ? feature : [feature];
      // Stored as comma-separated text; require ALL selected features.
      where.AND = [
        ...(where.AND ?? []),
        ...features.map((f) => ({
          features: {
            contains: f,
          },
        })),
      ];
    }

    if (roomCount) {
      where.roomCount = {
        gte: +roomCount,
      };
    }

    if (guestCount) {
      where.guestCount = {
        gte: +guestCount,
      };
    }

    if (bathroomCount) {
      where.bathroomCount = {
        gte: +bathroomCount,
      };
    }

    if (country) {
      where.country = country;
    }

    if (region) {
      where.region = region;
    }

    if (municipality) {
      where.municipality = municipality;
    }

    if (startDate && endDate) {
      where.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
            ],
          },
        },
      };
    }

    const filterQuery: any = {
      where,
      take: LISTINGS_BATCH,
      orderBy: { createdAt: "desc" },
    };

    if (cursor) {
      filterQuery.cursor = { id: cursor };
      filterQuery.skip = 1;
    }

    const listings = await db.listing.findMany(filterQuery);

    const nextCursor =
      listings.length === LISTINGS_BATCH
        ? listings[LISTINGS_BATCH - 1].id
        : null;

    return {
      listings,
      nextCursor,
    };
  } catch (error) {
    return {
      listings: [],
      nextCursor: null,
    };
  }
};

export const getListingById = async (id: string) => {
  const listing = await db.listing.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      reservations: {
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  return listing;
};

export const createListing = async (data: { [x: string]: any }) => {
  const {
    category,
    duration,
    features,
    location: { region, label: country, latlng },
    municipality,
    address,
    guestCount,
    bathroomCount,
    roomCount,
    image: legacyImage,
    images: imagesRaw,
    price,
    title,
    description,
  } = data;

  // Validate required fields
  const requiredFields = [
    "category",
    "duration",
    "location",
    "municipality",
    "address",
    "guestCount",
    "roomCount",
    "bathroomCount",
    // images are validated separately (can come from `images` or legacy `image`)
    "price",
    "title",
    "description",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const images: string[] = Array.isArray(imagesRaw)
    ? imagesRaw
    : typeof legacyImage === "string" && legacyImage
      ? [legacyImage]
      : [];

  if (!images.length) throw new Error("At least one image is required");
  if (images.length > 5) throw new Error("Maximum 5 images allowed");

  const imageSrc = images[0];

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized!");

  const listing = await db.listing.create({
    data: {
      title,
      description,
      imageSrc,
      images: JSON.stringify(images),
      category,
      duration,
      features: Array.isArray(features) ? features.join(",") : features || "",
      roomCount,
      bathroomCount,
      guestCount,
      country,
      region,
      municipality,
      address,
      latitude: latlng[0],
      longitude: latlng[1],
      price: parseInt(price, 10),
      userId: user.id,
    },
  });

  return listing;
};

export const getOwnedListingById = async (id: string) => {
  if (!id || typeof id !== "string") throw new Error("Invalid ID");

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized!");

  const listing = await db.listing.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!listing) throw new Error("Listing not found!");

  return listing;
};

export const updateListing = async (
  listingId: string,
  data: { [x: string]: any },
) => {
  if (!listingId || typeof listingId !== "string")
    throw new Error("Invalid ID");

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized!");

  const {
    category,
    duration,
    features,
    location,
    municipality,
    address,
    guestCount,
    bathroomCount,
    roomCount,
    image: legacyImage,
    images: imagesRaw,
    price,
    title,
    description,
  } = data;

  // Validate required fields (same as create)
  const requiredFields = [
    "category",
    "duration",
    "location",
    "municipality",
    "address",
    "guestCount",
    "roomCount",
    "bathroomCount",
    // images are validated separately (can come from `images` or legacy `image`)
    "price",
    "title",
    "description",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const images: string[] = Array.isArray(imagesRaw)
    ? imagesRaw
    : typeof legacyImage === "string" && legacyImage
      ? [legacyImage]
      : [];

  if (!images.length) throw new Error("At least one image is required");
  if (images.length > 5) throw new Error("Maximum 5 images allowed");

  const imageSrc = images[0];

  const region = location?.region;
  const country = location?.label;
  const latlng = location?.latlng;
  if (!region || !country || !Array.isArray(latlng) || latlng.length < 2) {
    throw new Error("Invalid location");
  }

  const updated = await db.listing.updateMany({
    where: {
      id: listingId,
      userId: user.id,
    },
    data: {
      title,
      description,
      imageSrc,
      images: JSON.stringify(images),
      category,
      duration,
      features: Array.isArray(features) ? features.join(",") : features || "",
      roomCount,
      bathroomCount,
      guestCount,
      country,
      region,
      municipality,
      address,
      latitude: latlng[0],
      longitude: latlng[1],
      price: parseInt(price, 10),
    },
  });

  if (!updated.count) throw new Error("Listing not found!");

  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/favorites");
  revalidatePath(`/listings/${listingId}`);

  return { id: listingId };
};
