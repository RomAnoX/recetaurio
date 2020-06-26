import { h } from "preact";
import Tabs from "./tabs";

const Header = () => (
  <header class="mb-auto">
    <div>
      <h3 class="float-md-left mb-0">Recetaurio</h3>
      <Tabs />
    </div>
  </header>
);

export default Header;
