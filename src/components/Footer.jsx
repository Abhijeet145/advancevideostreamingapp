import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>Made with love in NITT CSE {year}</p>
    </footer>
  );
}

export default Footer;