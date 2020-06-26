import { h, Fragment } from "preact";
import { route } from "preact-router";
import { useContext, useCallback } from "preact/hooks";
import { AuthContext } from "../../app";
import useGetRecipes from "../../components/hooks/use_get_recipes";

import Header from "./header";
import Loader from "../../components/loader";

const Dashboard = () => {
  const { appState, auth } = useContext(AuthContext);
  const [recipes, loading] = useGetRecipes();

  if (appState && !appState.isAuthenticated) {
    route("/");
  }

  const logout = useCallback(() => {
    auth.signOut();
  }, [auth]);

  return (
    <Fragment>
      <Header logout={logout} />
      <div class="container">
        <h1>Dashboard</h1>
        {loading ? (
          <Loader />
        ) : (
          recipes.map((recipe) => (
            <pre key={recipe.id}>{JSON.stringify(recipe, null, 2)}</pre>
          ))
        )}
      </div>
    </Fragment>
  );
};

export default Dashboard;
