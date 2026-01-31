"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./user";
import { revalidatePath } from "next/cache";

export const getFavorites = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) return [];
    const favorites = await db.favorite.findMany({
      where: {
        userId: user.id,
      },
      select: {
        listingId: true,
      },
    });

    return favorites.map((fav) => fav.listingId);
  } catch (error) {
    return [];
  }
};

export const updateFavorite = async ({
  listingId,
  favorite,
}: {
  listingId: string;
  favorite: boolean;
}) => {
  try {
    if (!listingId || typeof listingId !== "string") {
      throw new Error("Invalid ID");
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("Please sign in to favorite the listing!");
    }

    let hasFavorited;

    if (!favorite) {
      // Remove from favorites
      await db.favorite.deleteMany({
        where: {
          userId: currentUser.id,
          listingId: listingId,
        },
      });
      hasFavorited = false;
    } else {
      // Add to favorites (upsert to avoid duplicates)
      await db.favorite.upsert({
        where: {
          userId_listingId: {
            userId: currentUser.id,
            listingId: listingId,
          },
        },
        create: {
          userId: currentUser.id,
          listingId: listingId,
        },
        update: {},
      });
      hasFavorited = true;
    }

    revalidatePath("/");
    revalidatePath("/offers");
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/favorites");

    return {
      hasFavorited,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getFavoriteListings = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const favorites = await db.listing.findMany({
      where: {
        favoritedBy: {
          some: {
            userId: currentUser.id,
          },
        },
      },
    });

    return favorites;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
