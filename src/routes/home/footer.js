import { h } from "preact";

const Footer = () => (
  <footer class="mt-auto text-white-50">
    <p>
      Recetaurio {new Date().getFullYear()} by{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href="https://github.com/romanox"
        class="text-white"
      >
        @romanox
      </a>
      .
    </p>
  </footer>
);

export default Footer;
