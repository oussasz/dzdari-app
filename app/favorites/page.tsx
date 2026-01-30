import React from "react";

import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/ListingCard";
import Heading from "@/components/Heading";

import { getCurrentUser } from "@/services/user";
import { getFavoriteListings } from "@/services/favorite";
import { getTranslations } from "next-intl/server";

const FavoritesPage = async () => {
  const tEmpty = await getTranslations("Empty");
  const t = await getTranslations("Pages.favorites");

  const user = await getCurrentUser();

  if (!user) {
    return (
      <EmptyState
        title={tEmpty("unauthorized")}
        subtitle={tEmpty("pleaseLogin")}
      />
    );
  }

  const favorites = await getFavoriteListings();

  if (favorites.length === 0) {
    return <EmptyState title={t("emptyTitle")} subtitle={t("emptySubtitle")} />;
  }

  return (
    <section className="main-container">
      <Heading title={t("title")} subtitle={t("subtitle")} />
      <div className=" mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
        {favorites.map((listing) => {
          return <ListingCard key={listing.id} data={listing} hasFavorited />;
        })}
      </div>
    </section>
  );
};

export default FavoritesPage;
