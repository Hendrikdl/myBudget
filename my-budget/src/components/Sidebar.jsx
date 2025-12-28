//Import Statements - Slidebar
import React from "react";
import {
  BsCart3,
  BsGrid1X2Fill,
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsListCheck,
  BsMenuButtonWideFill,
  BsFillGearFill,
} from "react-icons/bs";
import { FcNews } from "react-icons/fc";
import { FcServices } from "react-icons/fc";
import { FcBullish } from "react-icons/fc";
import { FcBearish } from "react-icons/fc";
import { FcCurrencyExchange } from "react-icons/fc";
import { FcCollect } from "react-icons/fc";
import { FcDocument } from "react-icons/fc";
import { FcRegisteredTrademark } from "react-icons/fc";
import { Link } from "react-router-dom";

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
    >
      <div>
        <div>
          <FcRegisteredTrademark className="icon_header" />
          BUDGET
        </div>
        <button
          className="close_icon"
          onClick={OpenSidebar}
          aria-label="Close sidebar"
        >
          X
        </button>
      </div>

      <ul className="sidebar-list">
        <li className="sidebar-list-item">
          <Link to="/">
            <FcCollect className="icon" />
            Dashboard
          </Link>
        </li>
        <li className="sidebar-list-item">
          <Link to="/income">
            <FcBullish className="icon" />
            Income
          </Link>
        </li>
        <li className="sidebar-list-item">
          <Link to="/expenses">
            <FcBearish className="icon" />
            Expenses
          </Link>
        </li>
        <li className="sidebar-list-item">
          <Link to="/alerts">
            <BsListCheck className="icon" />
            Alerts
          </Link>
        </li>
        <li className="sidebar-list-item">
          <Link to="/reports">
            <FcNews className="icon" />
            Reports
          </Link>
        </li>
        <li className="sidebar-list-item">
          <Link to="/settings">
            <FcServices className="icon" />
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
