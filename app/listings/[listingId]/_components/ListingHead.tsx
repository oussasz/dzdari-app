import React from "react";
import Image from "@/components/Image";

import Heading from "@/components/Heading";
import HeartButton from "@/components/HeartButton";
import { getFavorites } from "@/services/favorite";

interface ListingHeadProps {
  title: string;
  country: string | null;
  region: string | null;
  image: string;
  images?: string[];
  id: string;
}

const ListingHead: React.FC<ListingHeadProps> = async ({
  title,
  country = "",
  region = "",
  image,
  images,
  id,
}) => {
  const favorites = await getFavorites();
  const hasFavorited = favorites.includes(id);

  const gallery = (Array.isArray(images) && images.length ? images : [image])
    .filter(Boolean)
    .slice(0, 5);

  const primary = gallery[0] ?? image;
  const thumbnails = gallery.slice(1);

  return (
    <>
      <Heading title={title} subtitle={`${region}, ${country}`} backBtn />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="md:col-span-3 w-full md:h-[420px] sm:h-[280px] bg-gray-100 h-[260px] overflow-hidden rounded-xl relative transition duration-300">
          <Image
            imageSrc={primary}
            fill
            className="object-cover"
            alt={title}
            sizes="100vw"
          />
          <div className="absolute top-5 right-5">
            <HeartButton listingId={id} hasFavorited={hasFavorited} />
          </div>
        </div>

        {thumbnails.length > 0 && (
          <div className="hidden md:grid md:col-span-1 grid-rows-4 gap-2 h-[420px]">
            {thumbnails.slice(0, 4).map((src) => (
              <div
                key={src}
                className="bg-gray-100 overflow-hidden rounded-xl relative"
              >
                <Image
                  imageSrc={src}
                  fill
                  className="object-cover"
                  alt={title}
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ListingHead;
