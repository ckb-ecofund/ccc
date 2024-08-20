import { ccc } from "@ckb-ccc/connector-react";
import { TabProps } from "../types";
import { useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";

export function Sign({ sendMessage, signer }: TabProps) {
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
            sendMessage("Signature:", sig);
          }}
        >
          Sign
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            if (
              await ccc.Signer.verifyMessage(
                messageToSign,
                JSON.parse(signature),
              )
            ) {
              sendMessage("Valid");
              return;
            }
            throw "Invalid";
          }}
        >
          Verify
        </Button>
      </div>
    </div>
  );
}
