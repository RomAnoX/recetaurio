import storage from "../../lib/storage";
import { useReducer } from "preact/hooks";

const initialState = {
  isAuthenticated: false,
  user: null,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case "LOGIN":
      storage.set("user", payload.user);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      storage.clear();
      return initialState;
    default:
      return state;
  }
};

const useAuthContext = () => {
  return useReducer(reducer, initialState);
};

export default useAuthContext;
