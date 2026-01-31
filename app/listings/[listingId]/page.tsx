import React from "react";

import EmptyState from "@/components/EmptyState";
import ListingHead from "./_components/ListingHead";
import ListingInfo from "./_components/ListingInfo";
import ListingClient from "./_components/ListingClient";

import { getCurrentUser } from "@/services/user";
import { getListingById } from "@/services/listing";

interface IParams {
  listingId: string;
}

const ListingPage = async ({ params: { listingId } }: { params: IParams }) => {
  const listing = await getListingById(listingId);
  const currentUser = await getCurrentUser();

  if (!listing) return <EmptyState />;

  const {
    title,
    imageSrc,
    images,
    country,
    region,
    id,
    user: owner,
    price,
    description,
    roomCount,
    guestCount,
    bathroomCount,
    latitude,
    longitude,
    reservations,
    duration,
    features,
  } = listing;

  const listingImages = (() => {
    if (typeof images === "string" && images) {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed)
          ? parsed
              .map((s) => String(s))
              .filter(Boolean)
              .slice(0, 5)
          : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  return (
    <section className="main-container">
      <div className="flex flex-col gap-6">
        <ListingHead
          title={title}
          image={imageSrc}
          images={listingImages}
          country={country}
          region={region}
          id={id}
        />
      </div>

      <ListingClient
        id={id}
        price={price}
        duration={duration}
        reservations={reservations}
        user={currentUser}
        title={title}
      >
        <ListingInfo
          user={owner}
          categoryLabel={listing.category}
          duration={duration}
          features={features}
          description={description}
          roomCount={roomCount}
          guestCount={guestCount}
          bathroomCount={bathroomCount}
          latitude={latitude}
          longitude={longitude}
        />
      </ListingClient>
    </section>
  );
};

export default ListingPage;
