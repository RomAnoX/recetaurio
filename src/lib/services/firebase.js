import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBB9mjGmtYdBzZbzNaLTEV0HHyHYUUIRNE",
  authDomain: "recetaurio.firebaseapp.com",
  databaseURL: "https://recetaurio.firebaseio.com",
  projectId: "recetaurio",
  storageBucket: "recetaurio.appspot.com",
  messagingSenderId: "648943718103",
  appId: "1:648943718103:web:41407e6eca122498f2ea92",
};

let instance = {};

export default () => {
  if (typeof window !== "undefined") {
    if (instance.app) return instance;
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.firestore();
    const providers = {};
    providers.google = new firebase.auth.GoogleAuthProvider();
    instance = { app, auth, database, providers };
    return instance;
  }

  return {};
};
