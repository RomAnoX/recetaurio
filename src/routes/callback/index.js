import { h } from "preact";
import { route } from "preact-router";
import { useContext, useEffect } from "preact/hooks";
import { AuthContext } from "../../app";
import Header from "../home/header";
import Footer from "../home/footer";
import Container from "../home/container";
import Loader from "../../components/loader";

const Callback = (props) => {
  const { loading, auth, appState, dispatch } = useContext(AuthContext);
  const { code, state } = props;

  if (!code || !state) {
    route("/");
  }

  if (appState.isAuthenticated) {
    route("/dashboard");
  }

  useEffect(() => {
    if (!loading && auth) {
      auth.handleCallback().then(() => {
        auth.getUser().then((user) => {
          dispatch({ type: "LOGIN", payload: { user } });
        });
      });
    }
  }, [loading, auth, dispatch]);

  return (
    <Container>
      <Header />
      <main class="px-3">
        <Loader size="large" />
        <p>Validando la informaci&oacute;n del usuario...</p>
      </main>
      <Footer />
    </Container>
  );
};

export default Callback;
