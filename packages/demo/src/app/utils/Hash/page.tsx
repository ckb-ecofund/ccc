"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { useState } from "react";
import { Button } from "@/src/components/Button";
import { TextInput } from "@/src/components/Input";
import { useApp } from "@/src/context";

export default function Hash() {
  const { createSender } = useApp();
  const { log } = createSender("Hash");

  const [messageToHash, setMessageToHash] = useState<string>("");

  return (
    <div className="mb-1 flex flex-col items-center gap-2">
      <TextInput
        label="Message"
        className="w-9/12"
        placeholder="Message to hash"
        state={[messageToHash, setMessageToHash]}
      />
      <div className="flex">
        <Button
          onClick={async () => {
            log("Hash:", ccc.hashCkb(ccc.bytesFrom(messageToHash, "utf8")));
          }}
        >
          Hash as UTF-8
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            log("Hash:", ccc.hashCkb(messageToHash));
          }}
        >
          Hash as hex
        </Button>
      </div>
    </div>
  );
}
