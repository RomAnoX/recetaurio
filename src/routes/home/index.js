import { h } from "preact";
import { route } from "preact-router";
import { useContext } from "preact/hooks";
import { AuthContext } from "../../app";

import Header from "./header";
import Footer from "./footer";
import classes from "./style.less";
import Container from "./container";

const Home = () => {
  const { loading, appState } = useContext(AuthContext);

  if (!loading && appState.isAuthenticated) {
    route("/dashboard/");
  }

  return (
    <Container>
      <Header />
      <main class="px-3">
        <h1>Organiza tus recetas.</h1>
        <p class="lead">
          Crea, clasifica y organiza todas las recetas que quieras y así poder
          revisarlas cuando quieras. ¿No sabes qué hacer hoy de comida? Puedes
          buscar recetas que hayas guardado previamente y así obtener ideas para
          deleitarte con deliciosos platillos hechos a tu manera.
        </p>
        <p class="lead">
          <a
            href="/login"
            class={`btn btn-lg btn-secondary font-weight-bold border-white bg-white ${classes.button}`}
          >
            Entra a tus recetas!
          </a>
        </p>
      </main>
      <Footer />
    </Container>
  );
};

export default Home;
