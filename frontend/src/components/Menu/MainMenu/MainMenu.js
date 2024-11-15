import React, { useState } from "react";
import Header from "../Header/Header";
import Sidebarn from "../Sidebarn/Sidebarn";
import "semantic-ui-css/semantic.min.css";
import style from "./MainMenu.module.css";

function MainMenu({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentYear = new Date().getFullYear(); // Obtiene el año actual

  return (
    <div className={style.container}>
      <Header />

      <div className={style.content}>
        <div
          className={`${style.sidebar} ${
            !sidebarOpen ? style.sidebarClosed : ""
          }`}
        >
          <Sidebarn closeOpen={sidebarOpen} setCloseOpen={setSidebarOpen} />
        </div>
        <div
          className={`${style.maincontent} ${
            !sidebarOpen ? style.maincontentExpanded : ""
          }`}
        >
          {children}
        </div>
      </div>

      <footer className={style.footer}>
        <p>Copyright © {currentYear} Uzai Velasco Hernandez</p>
      </footer>
    </div>
  );
}

export default MainMenu;
