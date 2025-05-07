import { useEffect, useRef } from "react";

export const Donate = () => {
  return (
    <a
      href="https://www.buymeacoffee.com/filebump"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/img/donate.png"
        alt="Buy Me A Coffee"
        style={{ height: "50px", width: "180px" }}
      />
    </a>
  );
}
