"use client";

import { ccc } from "@ckb-ccc/connector";
import { EventName, createComponent } from "@lit/react";
import * as React from "react";

export const Connector = createComponent({
  tagName: "ccc-connector",
  elementClass: ccc.WebComponentConnector,
  react: React,
  events: {
    onWillUpdate: "willUpdate" as EventName<ccc.WillUpdateEvent>,
    onClosed: "closed" as EventName<ccc.ClosedEvent>,
  },
});
