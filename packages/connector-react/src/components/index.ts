"use client";

import { ccc } from "@ckb-ccc/connector";
import { createComponent, type EventName } from "@lit/react";
import * as React from "react";

export const Connector = createComponent({
  tagName: "ccc-connector",
  elementClass: ccc.WebComponentConnector,
  react: React,
  events: {
    onConnected: "connected" as EventName<ccc.ConnectedEvent>,
    onClose: "close" as EventName<ccc.CloseEvent>,
  },
});
