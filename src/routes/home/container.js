import { h } from "preact";
import classes from "./style.less";

const Container = (props) => {
  const { children } = props;
  return (
    <div
      class={`${classes.wrapper} d-flex w-100 h-100 text-center text-white bg-dark`}
    >
      <div
        class={`${classes.container} d-flex w-100 h-100 p-3 mx-auto flex-column`}
      >
        {children}
      </div>
    </div>
  );
};

export default Container;
