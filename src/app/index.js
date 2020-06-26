import { h, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Router } from "preact-router";

// Code-splitting is automated for routes
import Home from "../routes/home";
import Login from "../routes/login";
import Profile from "../routes/profile";
import Contact from "../routes/contact";
import Callback from "../routes/callback";
import Dashboard from "../routes/dashboard";

// Hooks
import useAuthContext from "../components/hooks/use_auth_context";

// Services
import firebase from "../lib/services/firebase";

// Context
export const AuthContext = createContext("authContext");

const App = () => {
  const { auth } = firebase();
  const [appState, dispatch] = useAuthContext();

  // Checking logged user
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      console.log(user);
      if (user) {
        console.log("User Logged In");
        dispatch({ type: "LOGIN", payload: { user } });
      } else {
        console.log("User Logged Out");
        dispatch({ type: "LOGOUT" });
      }
    });
  }, [dispatch]);

  const handleRoute = (e) => {
    App.currentUrl = e.url;
  };

  return (
    <AuthContext.Provider value={{ appState, dispatch, auth }}>
      <Router onChange={handleRoute}>
        <Home path="/" />
        <Login path="/login/" />
        <Contact path="/contact/" />
        <Callback path="/callback/" />
        <Dashboard path="/dashboard/" />

        <Profile path="/profile/" user="me" />
        <Profile path="/profile/:user" />
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
