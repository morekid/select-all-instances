import App from "@/src/App";
import * as React from "react";
import { createRoot } from "react-dom/client";

const domNode = document.getElementById("root") as HTMLElement;
const root = createRoot(domNode);
root.render(<App />);
