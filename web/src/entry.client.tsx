import { HydratedRouter } from "react-router/dom";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HydratedRouter />
  </React.StrictMode>
);