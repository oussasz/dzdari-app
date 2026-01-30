"use client";
import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import { useLocale, useTranslations } from "next-intl";

import Avatar from "../Avatar";
import MenuItem from "./MenuItem";
import Menu from "@/components/Menu";
import RentModal from "../modals/RentModal";
import Modal from "../modals/Modal";
import AuthModal from "../modals/AuthModal";
import { type Locale } from "@/i18n/routing";

interface UserMenuProps {
  user?: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const tMenu = useTranslations("Menu");
  const tNav = useTranslations("Navbar");
  const tLang = useTranslations("Language");

  const redirect = (url: string) => {
    router.push(url);
  };

  const setLocale = async (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.refresh();
  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <Modal>
          <Modal.Trigger name={user ? "share" : "login"}>
            <button
              type="button"
              className="hidden md:block text-sm font-bold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer text-[#585858]"
            >
              {tNav("shareHome")}
            </button>
          </Modal.Trigger>
          <Menu>
            <Menu.Toggle id="user-menu">
              <button
                type="button"
                className=" p-4 md:py-1 md:px-2 border-[1px]   border-neutral-200  flex  flex-row  items-center   gap-3   rounded-full   cursor-pointer   hover:shadow-md   transition duration-300"
              >
                <AiOutlineMenu />
                <div className="hidden md:block">
                  <Avatar src={user?.image} />
                </div>
              </button>
            </Menu.Toggle>
            <Menu.List className="shadow-[0_0_36px_4px_rgba(0,0,0,0.075)] rounded-xl bg-white text-sm">
              {user ? (
                <>
                  <MenuItem
                    label={tMenu("myTrips")}
                    onClick={() => redirect("/trips")}
                  />
                  <MenuItem
                    label={tMenu("myFavorites")}
                    onClick={() => redirect("/favorites")}
                  />
                  <MenuItem
                    label={tMenu("myReservations")}
                    onClick={() => redirect("/reservations")}
                  />
                  <MenuItem
                    label={tMenu("myProperties")}
                    onClick={() => redirect("/properties")}
                  />

                  <Modal.Trigger name="share">
                    <MenuItem label={tNav("shareHome")} />
                  </Modal.Trigger>
                  <hr />
                  <MenuItem label={tMenu("logOut")} onClick={signOut} />
                  <hr />
                  <div className="px-4 py-2 text-[11px] font-semibold text-neutral-500">
                    {tLang("label")}
                  </div>
                  <MenuItem
                    label={`${locale === "en" ? "✓ " : ""}${tLang("english")}`}
                    onClick={() => setLocale("en")}
                  />
                  <MenuItem
                    label={`${locale === "fr" ? "✓ " : ""}${tLang("french")}`}
                    onClick={() => setLocale("fr")}
                  />
                  <MenuItem
                    label={`${locale === "ar" ? "✓ " : ""}${tLang("arabic")}`}
                    onClick={() => setLocale("ar")}
                  />
                </>
              ) : (
                <>
                  <Modal.Trigger name="login">
                    <MenuItem label={tMenu("logIn")} />
                  </Modal.Trigger>

                  <Modal.Trigger name="signup">
                    <MenuItem label={tMenu("signUp")} />
                  </Modal.Trigger>
                  <hr />
                  <div className="px-4 py-2 text-[11px] font-semibold text-neutral-500">
                    {tLang("label")}
                  </div>
                  <MenuItem
                    label={`${locale === "en" ? "✓ " : ""}${tLang("english")}`}
                    onClick={() => setLocale("en")}
                  />
                  <MenuItem
                    label={`${locale === "fr" ? "✓ " : ""}${tLang("french")}`}
                    onClick={() => setLocale("fr")}
                  />
                  <MenuItem
                    label={`${locale === "ar" ? "✓ " : ""}${tLang("arabic")}`}
                    onClick={() => setLocale("ar")}
                  />
                </>
              )}
            </Menu.List>
          </Menu>
          <Modal.Window name="login">
            <AuthModal name="Login" />
          </Modal.Window>
          <Modal.Window name="signup">
            <AuthModal name="Sign up" />
          </Modal.Window>
          <Modal.Window name="share">
            <RentModal />
          </Modal.Window>
        </Modal>
      </div>
    </div>
  );
};

export default UserMenu;
