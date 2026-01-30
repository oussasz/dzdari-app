"use client";
import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { Range } from "react-date-range";
import { User } from "next-auth";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

import ListingReservation from "./ListingReservation";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface ListingClientProps {
  reservations?: {
    startDate: Date;
    endDate: Date;
  }[];
  children: ReactNode;
  id: string;
  title: string;
  price: number;
  user:
    | (User & {
        id: string;
      })
    | undefined;
}

const ListingClient: React.FC<ListingClientProps> = ({
  price,
  reservations = [],
  children,
  user,
  id,
  title,
}) => {
  const tListing = useTranslations("Listing");
  const tUC = useTranslations("UnderConstruction");

  const [totalPrice, setTotalPrice] = useState(price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [isLoading, startTransition] = useTransition();
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];
    reservations.forEach((reservation) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });
    return dates;
  }, [reservations]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInCalendarDays(
        dateRange.endDate,
        dateRange.startDate,
      );

      if (dayCount && price) {
        setTotalPrice((dayCount + 1) * price);
      } else {
        setTotalPrice(price);
      }
    }
  }, [dateRange.endDate, dateRange.startDate, price]);

  const onCreateReservation = () => {
    if (!user) return toast.error(tListing("loginToReserve"));
    setShowUnderConstruction(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
      {children}

      <div className="order-first mb-10 md:order-last md:col-span-3">
        <ListingReservation
          price={price}
          totalPrice={totalPrice}
          onChangeDate={(name, value) => setDateRange(value)}
          dateRange={dateRange}
          onSubmit={onCreateReservation}
          isLoading={isLoading}
          disabledDates={disabledDates}
        />
      </div>

      {/* Under Construction Modal */}
      {showUnderConstruction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {tUC("title")}
            </h2>
            <p className="text-gray-600 mb-6">{tUC("body")}</p>
            <button
              onClick={() => setShowUnderConstruction(false)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              {tUC("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingClient;
