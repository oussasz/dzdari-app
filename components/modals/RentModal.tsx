"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Modal from "./Modal";
import Button from "../Button";
import SpinnerMini from "../Loader";
import Heading from "../Heading";
import Counter from "../inputs/Counter";
import Input from "../inputs/Input";
import CategoryButton from "../inputs/CategoryButton";
import AlgeriaLocationSelect from "../inputs/AlgeriaLocationSelect";
import ImagesUpload from "../ImagesUpload";
import FeatureSelect from "../inputs/FeatureSelect";

import {
  durationCategories,
  purposeCategories,
  featureCategories,
} from "@/utils/constants";
import { createListing, updateListing } from "@/services/listing";

const steps: { [key: string]: string } = {
  "0": "duration",
  "1": "category",
  "2": "features",
  "3": "location",
  "4": "guestCount",
  "5": "image",
  "6": "title",
  "7": "price",
};

enum STEPS {
  DURATION = 0,
  PURPOSE = 1,
  FEATURES = 2,
  LOCATION = 3,
  INFO = 4,
  IMAGES = 5,
  DESCRIPTION = 6,
  PRICE = 7,
}

type RentModalMode = "create" | "edit";

type RentModalProps = {
  onCloseModal?: () => void;
  mode?: RentModalMode;
  listingId?: string;
  initialValues?: FieldValues;
};

const RentModal = ({
  onCloseModal,
  mode = "create",
  listingId,
  initialValues,
}: RentModalProps) => {
  const tRent = useTranslations("Rent");
  const tCommon = useTranslations("Common");
  const tDuration = useTranslations("DurationOptions");
  const tPurpose = useTranslations("PurposeOptions");
  const tFeature = useTranslations("FeatureOptions");

  const [step, setStep] = useState(STEPS.DURATION);
  const [isLoading, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    getValues,
  } = useForm<FieldValues>({
    defaultValues: {
      duration: "",
      category: "",
      features: [] as string[],
      location: null,
      wilayaCode: "",
      municipality: "",
      address: "",
      guestCount: 1,
      bathroomCount: 1,
      roomCount: 1,
      images: [] as string[],
      price: "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !initialValues) return;
    reset({
      duration: "",
      category: "",
      features: [] as string[],
      location: null,
      wilayaCode: "",
      municipality: "",
      address: "",
      guestCount: 1,
      bathroomCount: 1,
      roomCount: 1,
      images: [] as string[],
      price: "",
      title: "",
      description: "",
      ...initialValues,
    });
  }, [initialValues, mode, reset]);

  const location = watch("location");
  const features = watch("features") || [];
  const wilayaCode = watch("wilayaCode");
  const municipality = watch("municipality");
  const duration = watch("duration");

  const durationId = useMemo(() => {
    if (!duration) return null;
    const match = durationCategories.find(
      (d) => d.id === duration || d.label === duration,
    );
    return match?.id ?? null;
  }, [duration]);

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [],
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = getValues("features") || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f: string) => f !== feature)
      : [...currentFeatures, feature];
    setCustomValue("features", newFeatures);
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) return onNext();

    startTransition(async () => {
      try {
        if (mode === "edit") {
          if (!listingId) throw new Error("Missing listingId");
          await updateListing(listingId, data);
          toast.success(tRent("updatedSuccess", { title: data.title }));
        } else {
          const newListing = await createListing(data);
          toast.success(tRent("createdSuccess", { title: data.title }));
          router.push(`/listings/${newListing.id}`);
        }
        queryClient.invalidateQueries({
          queryKey: ["listings"],
        });
        queryClient.invalidateQueries({
          queryKey: ["properties"],
        });
        reset();
        setStep(STEPS.DURATION);
        onCloseModal?.();
        router.refresh();
        if (mode === "edit") router.push(`/listings/${listingId}`);
      } catch (error: any) {
        toast.error(
          mode === "edit" ? tRent("updateFailed") : tRent("createFailed"),
        );
        console.log(error?.message);
      }
    });
  };

  const body = () => {
    switch (step) {
      case STEPS.DURATION:
        return (
          <div className="flex flex-col gap-2">
            <Heading
              title={tRent("durationTitle")}
              subtitle={tRent("durationSubtitle")}
            />
            <div className="flex-1 grid grid-cols-2 gap-3 max-h-[60vh] lg:max-h-[260px] overflow-y-scroll scroll-smooth">
              {durationCategories.map((item) => (
                <CategoryButton
                  onClick={setCustomValue}
                  watch={watch}
                  label={item.label}
                  displayLabel={tDuration(`${item.id}.label`)}
                  icon={item.icon}
                  key={item.label}
                  name="duration"
                />
              ))}
            </div>
          </div>
        );

      case STEPS.PURPOSE:
        return (
          <div className="flex flex-col gap-2">
            <Heading
              title={tRent("purposeTitle")}
              subtitle={tRent("purposeSubtitle")}
            />
            <div className="flex-1 grid grid-cols-2 gap-3 max-h-[60vh] lg:max-h-[260px] overflow-y-scroll scroll-smooth">
              {purposeCategories.map((item) => (
                <CategoryButton
                  onClick={setCustomValue}
                  watch={watch}
                  label={item.label}
                  displayLabel={tPurpose(`${item.id}.label`)}
                  icon={item.icon}
                  key={item.label}
                  name="category"
                />
              ))}
            </div>
          </div>
        );

      case STEPS.FEATURES:
        return (
          <div className="flex flex-col gap-2">
            <Heading
              title={tRent("featuresTitle")}
              subtitle={tRent("featuresSubtitle")}
            />
            <div className="flex-1 grid grid-cols-2 gap-2 max-h-[60vh] lg:max-h-[300px] overflow-y-scroll scroll-smooth">
              {featureCategories.map((item) => (
                <FeatureSelect
                  key={item.label}
                  label={item.label}
                  displayLabel={tFeature(`${item.id}.label`)}
                  icon={item.icon}
                  selected={features.includes(item.label)}
                  onClick={toggleFeature}
                />
              ))}
            </div>
          </div>
        );

      case STEPS.LOCATION:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title={tRent("locationTitle")}
              subtitle={tRent("locationSubtitle")}
            />
            <AlgeriaLocationSelect
              wilayaCode={wilayaCode}
              municipality={municipality}
              onChange={setCustomValue}
            />

            <Input
              id="address"
              label={tRent("addressLabel")}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              watch={watch}
            />
            <div className="h-[240px]">
              <Map center={location?.latlng} />
            </div>
          </div>
        );

      case STEPS.INFO:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title={tRent("infoTitle")}
              subtitle={tRent("infoSubtitle")}
            />
            <Counter
              title={tRent("guestsTitle")}
              subtitle={tRent("guestsSubtitle")}
              watch={watch}
              onChange={setCustomValue}
              name="guestCount"
            />
            <hr />
            <Counter
              onChange={setCustomValue}
              watch={watch}
              title={tRent("roomsTitle")}
              subtitle={tRent("roomsSubtitle")}
              name="roomCount"
            />
            <hr />
            <Counter
              onChange={setCustomValue}
              watch={watch}
              title={tRent("bathroomsTitle")}
              subtitle={tRent("bathroomsSubtitle")}
              name="bathroomCount"
            />
          </div>
        );

      case STEPS.IMAGES:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title={tRent("imagesTitle")}
              subtitle={tRent("imagesSubtitle")}
            />
            <ImagesUpload
              onChange={setCustomValue}
              initialImages={getValues("images")}
              max={5}
            />
          </div>
        );

      case STEPS.DESCRIPTION:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title={tRent("descriptionTitle")}
              subtitle={tRent("descriptionSubtitle")}
            />
            <Input
              id="title"
              label={tRent("titleLabel")}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              watch={watch}
              autoFocus
            />
            <hr />
            <Input
              id="description"
              label={tRent("descriptionLabel")}
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              watch={watch}
            />
          </div>
        );

      case STEPS.PRICE:
        return (
          <div className="flex flex-col gap-6">
            <Heading
              title={tRent("priceTitle")}
              subtitle={tRent("priceSubtitle")}
            />
            <div className="relative">
              <span className="absolute top-[13px] left-3 text-[15px] font-medium text-neutral-600 z-10">
                DZD
              </span>
              <Input
                key="price"
                id="price"
                label={
                  durationId
                    ? tRent("priceLabelWithDuration", {
                        duration: tDuration(`${durationId}.label`),
                      })
                    : tRent("priceLabel")
                }
                type="number"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                watch={watch}
                autoFocus
                className="pl-10"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if current step field is filled
  const isFieldFilled = () => {
    const stepField = steps[step];
    if (stepField === "features") return true; // Features are optional
    if (stepField === "guestCount") return true; // Has default value
    if (stepField === "image") {
      const imgs = getValues("images");
      return Array.isArray(imgs) && imgs.length > 0;
    }
    return !!getValues(stepField);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Modal.WindowHeader
        title={mode === "edit" ? tRent("editHeader") : tRent("header")}
      />
      <form
        className="flex-1 md:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative p-6">{body()}</div>
        <div className="flex flex-col gap-2 px-6 pb-6 pt-3">
          {/* Step indicator */}
          <div className="flex justify-center gap-1 mb-2">
            {Object.keys(steps).map((_, index) => (
              <div
                key={index}
                className={`h-1 w-8 rounded-full transition ${
                  index <= step ? "bg-rose-500" : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <div className="flex flex-row items-center gap-4 w-full">
            {step !== STEPS.DURATION ? (
              <Button
                type="button"
                className="flex items-center gap-2 justify-center"
                onClick={onBack}
                outline
              >
                {tCommon("back")}
              </Button>
            ) : null}
            <Button
              type="submit"
              className="flex items-center gap-2 justify-center"
              disabled={isLoading || !isFieldFilled()}
            >
              {isLoading ? (
                <SpinnerMini />
              ) : step === STEPS.PRICE ? (
                mode === "edit" ? (
                  tCommon("update")
                ) : (
                  tCommon("create")
                )
              ) : (
                tCommon("next")
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RentModal;
