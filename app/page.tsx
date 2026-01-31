import React, { FC, Suspense } from "react";

import ListingCard from "@/components/ListingCard";
import LoadMore from "@/components/LoadMore";
import EmptyState from "@/components/EmptyState";
import Search from "@/components/navbar/Search";
import Categories from "@/components/navbar/Categories";
import { CTASection, Footer, Hero } from "@/components/landing";

import { getListings } from "@/services/listing";
import { getFavorites } from "@/services/favorite";
import { getCurrentUser } from "@/services/user";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams?: { [key: string]: string | undefined };
}

const Home: FC<HomeProps> = async ({ searchParams }) => {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/offers");
  }

  const t = await getTranslations("Pages.home");

  const { listings, nextCursor } = await getListings(searchParams);
  const favorites = await getFavorites();

  return (
    <>
      <Hero title={t("heroTitle")} subtitle={t("heroSubtitle")}>
        <Suspense fallback={<></>}>
          <Search />
        </Suspense>
      </Hero>

      <section className="bg-white">
        <div className="main-container py-10 md:py-14">
          <div className="flex flex-col gap-2 text-center items-center">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">
              {t("featuredTitle")}
            </h2>
            <p className="text-sm text-neutral-600 md:text-base max-w-2xl">
              {t("featuredSubtitle")}
            </p>
          </div>
        </div>

        {/* Categories bar spans full width for edge detection */}
        <div className="w-full">
          <Suspense fallback={<></>}>
            <Categories />
          </Suspense>
        </div>

        <div className="main-container">
          {!listings || listings.length === 0 ? (
            <div className="pt-6 pb-10">
              <EmptyState
                title={t("noListingsTitle")}
                subtitle={t("noListingsSubtitle")}
              />
            </div>
          ) : (
            <div className="pt-6 pb-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
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

      <CTASection
        title={t("cta.title")}
        subtitle={t("cta.subtitle")}
        primaryHref={"/offers"}
        primaryLabel={t("cta.primary")}
      />

      <Footer
        tagline={t("footer.tagline")}
        exploreTitle={t("footer.explore")}
        legalTitle={t("footer.legal")}
        exploreLinks={[
          { label: t("footer.links.favorites"), href: "/favorites" },
          { label: t("footer.links.trips"), href: "/trips" },
          { label: t("footer.links.properties"), href: "/properties" },
        ]}
        legalLinks={[
          { label: t("footer.links.privacy"), href: "/" },
          { label: t("footer.links.terms"), href: "/" },
        ]}
      />
    </>
  );
};

export default Home;
