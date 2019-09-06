import "normalize.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import yomisJSONUrl from "./yomis.json";

async function main(): Promise<void> {
  const yomis = await fetch(yomisJSONUrl).then(response => response.json());
  ReactDOM.render(<App yomis={yomis} />, document.getElementById("app"));
}

main();
