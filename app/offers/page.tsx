import React, { FC, Suspense } from "react";

import ListingCard from "@/components/ListingCard";
import LoadMore from "@/components/LoadMore";
import EmptyState from "@/components/EmptyState";
import Search from "@/components/navbar/Search";
import Categories from "@/components/navbar/Categories";

import { getListings } from "@/services/listing";
import { getFavorites } from "@/services/favorite";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

interface OffersProps {
  searchParams?: { [key: string]: string | undefined };
}

const OffersPage: FC<OffersProps> = async ({ searchParams }) => {
  const t = await getTranslations("Pages.offers");

  const { listings, nextCursor } = await getListings(searchParams);
  const favorites = await getFavorites();

  return (
    <section className="bg-white">
      <div className="main-container py-10 md:py-14">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<></>}>
            <Search />
          </Suspense>

          <Suspense fallback={<></>}>
            <Categories />
          </Suspense>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              title={t("noListingsTitle")}
              subtitle={t("noListingsSubtitle")}
            />
          </div>
        ) : (
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
            {listings.map((listing) => {
              const hasFavorited = favorites.includes(listing.id);
              return (
                <ListingCard
                  key={listing.id}
                  data={listing}
                  hasFavorited={hasFavorited}
                />
              );
            })}
            {nextCursor ? (
              <Suspense fallback={<></>}>
                <LoadMore
                  nextCursor={nextCursor}
                  fnArgs={searchParams}
                  queryFn={getListings}
                  queryKey={["listings", searchParams]}
                  favorites={favorites}
                />
              </Suspense>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default OffersPage;
