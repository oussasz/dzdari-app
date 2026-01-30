"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";

import RentModal from "./RentModal";
import SpinnerMini from "../Loader";
import Modal from "./Modal";

import { getOwnedListingById } from "@/services/listing";
import wilayas from "@/data/algeria-wilayas.json";

type EditListingModalProps = {
  listingId: string;
  onCloseModal?: () => void;
};

const DZ_LOCATION_BASE = {
  value: "DZ",
  label: "Algeria",
  flag: "🇩🇿",
} as const;

const splitFeatures = (raw?: string | null) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const inferWilayaCode = (region?: string | null) => {
  if (!region) return "";
  const match = (wilayas as any[]).find(
    (w) => w?.nameFr === region || w?.nameAr === region,
  );
  return match?.code ?? "";
};

const parseImages = (raw?: string | null, fallback?: string | null) => {
  const tryJson = () => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((s) => String(s)).filter(Boolean)
        : null;
    } catch {
      return null;
    }
  };

  const parsed = tryJson();
  if (parsed && parsed.length) return parsed.slice(0, 5);
  return fallback ? [fallback] : [];
};

const EditListingModal: React.FC<EditListingModalProps> = ({
  listingId,
  onCloseModal,
}) => {
  const [isLoading, startTransition] = useTransition();
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const listing = await getOwnedListingById(listingId);

        const derivedWilayaCode = inferWilayaCode(listing.region);
        const lat = listing.latitude;
        const lng = listing.longitude;
        const hasLatLng = typeof lat === "number" && typeof lng === "number";

        setInitialValues({
          duration: listing.duration ?? "",
          category: listing.category ?? "",
          features: splitFeatures(listing.features),
          location:
            hasLatLng && listing.region
              ? {
                  ...DZ_LOCATION_BASE,
                  label: listing.country ?? DZ_LOCATION_BASE.label,
                  region: listing.region,
                  latlng: [lat, lng],
                }
              : null,
          wilayaCode: derivedWilayaCode,
          municipality: listing.municipality ?? "",
          address: listing.address ?? "",
          guestCount: listing.guestCount ?? 1,
          bathroomCount: listing.bathroomCount ?? 1,
          roomCount: listing.roomCount ?? 1,
          images: parseImages((listing as any).images ?? null, listing.imageSrc),
          price: listing.price != null ? String(listing.price) : "",
          title: listing.title ?? "",
          description: listing.description ?? "",
        });
      } catch (e: any) {
        toast.error(e?.message || "Failed to load listing");
        onCloseModal?.();
      }
    });
  }, [listingId, onCloseModal]);

  const loadingUi = useMemo(() => {
    return (
      <div className="w-full h-full flex flex-col">
        <Modal.WindowHeader title="Edit property" />
        <div className="p-6 flex items-center justify-center">
          <SpinnerMini />
        </div>
      </div>
    );
  }, []);

  if (!initialValues) return loadingUi;

  return (
    <RentModal
      mode="edit"
      listingId={listingId}
      initialValues={initialValues}
      onCloseModal={onCloseModal}
    />
  );
};

export default EditListingModal;
