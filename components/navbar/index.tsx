import React from "react";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import { getCurrentUser } from "@/services/user";
import HeaderHeight from "./HeaderHeight";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = async () => {
  const user = await getCurrentUser();

  return (
    <header
      id="site-header"
      className="fixed top-0 left-0 w-full bg-white z-10"
    >
      <HeaderHeight />
      <nav className="py-3 border-b-[1px]">
        <div className="flex flex-row flex-wrap md:flex-nowrap main-container justify-between items-center gap-3 md:gap-0">
          <div className="order-1 shrink-0">
            <Logo />
          </div>
          <div className="order-2 md:order-3 shrink-0">
            <UserMenu user={user} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
