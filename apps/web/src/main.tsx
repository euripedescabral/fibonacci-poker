import { render } from "preact";
import { App } from "./app.js";
import "./styles/tokens.css";
import "./styles/app.css";
render(<App />, document.getElementById("app")!);
