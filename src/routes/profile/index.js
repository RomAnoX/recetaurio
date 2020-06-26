import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import style from "./style";

const Profile = (props) => {
  const { user } = props;
  const [time, setTime] = useState(Date.now());
  const [count, setCount] = useState(10);

  const updateTime = () => setTime(Date.now());
  const increment = () => setCount(count + 1);

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div class={style.profile}>
      <h1>Profile: {user}</h1>
      <p>This is the user profile for a user named {user}.</p>

      <div>Current time: {new Date(time).toLocaleString()}</div>

      <p>
        <button class="btn btn-primary" onClick={increment} primary>
          Click Me
        </button>{" "}
        Clicked {count} times.
      </p>
    </div>
  );
};

export default Profile;

// export default class Profile extends Component {
// 	state = {
// 		time: Date.now(),
// 		count: 10
// 	};

// 	// update the current time
// 	updateTime = () => {
// 		this.setState({ time: Date.now() });
// 	};

// 	increment = () => {
// 		this.setState({ count: this.state.count+1 });
// 	};

// 	// gets called when this route is navigated to
// 	componentDidMount() {
// 		// start a timer for the clock:
// 		this.timer = setInterval(this.updateTime, 1000);
// 	}

// 	// gets called just before navigating away from the route
// 	componentWillUnmount() {
// 		clearInterval(this.timer);
// 	}

// 	// Note: `user` comes from the URL, courtesy of our router
// 	render({ user }, { time, count }) {
// 		return (
// 			<div class={style.profile}>
// 				<h1>Profile: {user}</h1>
// 				<p>This is the user profile for a user named { user }.</p>

// 				<div>Current time: {new Date(time).toLocaleString()}</div>

// 				<p>
// 					<button onClick={this.increment}>Click Me</button>
// 					{' '}
// 					Clicked {count} times.
// 				</p>
// 			</div>
// 		);
// 	}
// }
