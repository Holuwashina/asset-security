import React from "react";
import Menuitems from "./MenuItems";
import { usePathname } from "next/navigation";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;
  
  return (
    <div>
      <nav className="sidebarNav">
        {Menuitems.map((item) => {
          // SubHeader
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // If Sub Menu
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={toggleMobileSidebar}
              />
            );
          }
        })}
      </nav>
    </div>
  );
};
export default SidebarItems;
