import { h, Fragment } from "preact";
import { route } from "preact-router";
import { useContext, useState } from "preact/hooks";
import { AuthContext } from "../../app";
import Header from "../home/header";
import Footer from "../home/footer";
import Container from "../home/container";
import classes from "./style.less";

const Login = () => {
  const { appState, auth } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const valid = credentials.email && credentials.password;

  if (appState && appState.isAuthenticated) {
    route("/dashboard/");
  }

  const handleChange = (name) => (evt) => {
    setCredentials({ ...credentials, [name]: evt.target.value });
  };

  const login = () => {
    if (!valid) return;
    const { email, password } = credentials;
    auth
      .signInWithEmailAndPassword(email, password)
      .then((cred) => {
        console.log(auth.currentUser, cred);
      })
      .catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
        console.log(error);
        // ...
      });
  };

  return (
    <Container>
      <Header />
      <main class="px-3">
        <div class={classes.loginForm}>
          <img
            class="mb-4"
            src="/docs/5.0/assets/brand/bootstrap-solid.svg"
            alt=""
            width="72"
            height="72"
          />
          <h1 class="h3 mb-3 font-weight-normal">Organiza tus recetas</h1>
          <label for="inputEmail" class="sr-only">
            Correo electronico
          </label>
          <input
            type="email"
            id="inputEmail"
            class={`form-control ${classes.formControl}`}
            value={credentials.email}
            placeholder="Correo electronico"
            onInput={handleChange("email")}
            required=""
            autofocus=""
          />
          <label for="inputPassword" class="sr-only">
            Contrase&ntilde;a
          </label>
          <input
            type="password"
            id="inputPassword"
            class={`form-control ${classes.formControl}`}
            value={credentials.password}
            placeholder="Contrase&ntilde;a"
            onInput={handleChange("password")}
            required=""
          />
          <button
            class="btn btn-lg btn-primary btn-block"
            disabled={!valid}
            onClick={login}
          >
            Ingresar
          </button>
        </div>
      </main>
      <Footer />
    </Container>
  );
};

export default Login;
