import "normalize.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import yomiListJSONUrl from "./yomiList.json";

async function main(): Promise<void> {
  const yomiList = await fetch(yomiListJSONUrl).then((response) =>
    response.json()
  );
  ReactDOM.render(
    <App allYomiList={yomiList} />,
    document.getElementById("app")
  );
}

main();
