import { h } from "preact";
import { Link } from "preact-router/match";
import classes from "./style.less";

const Tabs = () => (
  <nav class={`nav justify-content-center float-md-right`}>
    <Link
      activeClassName={classes.active}
      class={`nav-link ${classes.link}`}
      href="/"
    >
      Inicio
    </Link>
    <Link
      activeClassName={classes.active}
      class={`nav-link ${classes.link}`}
      href="/login"
    >
      Entrar
    </Link>
    <Link
      activeClassName={classes.active}
      class={`nav-link ${classes.link}`}
      href="/contact"
    >
      Contacto
    </Link>
  </nav>
);

export default Tabs;
