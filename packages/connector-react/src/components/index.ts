"use client";

import {
  CloseEvent,
  ConnectedEvent,
  WebComponentConnector,
} from "@ckb-ccc/connector";
import { createComponent, type EventName } from "@lit/react";
import * as React from "react";

export const Connector = createComponent({
  tagName: "ccc-connector",
  elementClass: WebComponentConnector,
  react: React,
  events: {
    onConnected: "connected" as EventName<ConnectedEvent>,
    onClose: "close" as EventName<CloseEvent>,
  },
});
