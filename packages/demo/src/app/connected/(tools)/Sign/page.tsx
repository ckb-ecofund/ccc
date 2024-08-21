"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { useState } from "react";
import { Button } from "@/src/components/Button";
import { TextInput } from "@/src/components/Input";
import { useApp } from "@/src/context";
import { ButtonsPanel } from "@/src/components/ButtonsPanel";

export default function Sign() {
  const { signer, createSender } = useApp();
  const { log, error } = createSender("Sign");

  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  return (
    <div className="flex w-full flex-col items-stretch">
      <TextInput
        label="Message"
        placeholder="Message to sign and verify"
        state={[messageToSign, setMessageToSign]}
      />
      <ButtonsPanel>
        <Button
          onClick={async () => {
            if (!signer) {
              return;
            }
            const sig = JSON.stringify(await signer.signMessage(messageToSign));
            setSignature(sig);
            log("Signature:", sig);
          }}
        >
          Sign
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            if (
              !(await ccc.Signer.verifyMessage(
                messageToSign,
                JSON.parse(signature),
              ))
            ) {
              error("Invalid");
              return;
            }
            log("Valid");
          }}
        >
          Verify
        </Button>
      </ButtonsPanel>
    </div>
  );
}
