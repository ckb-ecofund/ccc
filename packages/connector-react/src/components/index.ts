"use client";

import { ccc } from "@ckb-ccc/connector";
import { createComponent } from "@lit/react";
import * as React from "react";

export const Connector = createComponent({
  tagName: "ccc-connector",
  elementClass: ccc.WebComponentConnector,
  react: React,
  events: {
    onWillUpdate: "willUpdate",
    onClose: "close",
  },
});
