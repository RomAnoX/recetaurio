import { h } from "preact";
import classes from "./style.less";

const Loader = (props) => {
  const { style = "", size = "medium" } = props;
  return <div class={`${classes[size]} ${style}`} />;
};

export default Loader;
