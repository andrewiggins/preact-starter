import { render } from "preact";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
render(<div>Hello World</div>, root);
