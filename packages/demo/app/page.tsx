"use client";

import { ccc } from "@ckb-ccc/connector-react";
import Home from "./home";

export default function Root() {
  return (
    <ccc.Provider>
      <Home />
    </ccc.Provider>
  );
}
