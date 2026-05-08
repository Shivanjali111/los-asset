import React from "react";
import "./amplify";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";

import App from "./App.jsx";
import amplifyConfig from "./amplifyConfig.js";

import "./index.css";

Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);