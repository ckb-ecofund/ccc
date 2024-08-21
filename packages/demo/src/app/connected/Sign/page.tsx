"use client";

import { ccc } from "@ckb-ccc/connector-react";
import React, { useState } from "react";
import { Button } from "@/src/components/Button";
import { TextInput } from "@/src/components/Input";
import { useApp } from "@/src/context";

export default function Sign() {
  const { signer, createSender } = useApp();
  const { log, error } = createSender("Sign");

  const [messageToSign, setMessageToSign] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  return (
    <div className="mb-1  flex w-9/12 flex-col items-stretch gap-2">
      <TextInput
        label="Message"
        placeholder="Message to sign and verify"
        state={[messageToSign, setMessageToSign]}
      />
      <div className="flex justify-center">
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
      </div>
    </div>
  );
}
