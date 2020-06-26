import { useState, useEffect } from "preact/hooks";
import firebase from "../../lib/services/firebase";

export default () => {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const { database } = firebase();

  const getRecipes = () => {
    setLoading(true);
    database
      .collection("recipes")
      .get()
      .then((snapshot) => {
        setRecipes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getRecipes();
  }, []);

  return [recipes, loading, getRecipes];
};
