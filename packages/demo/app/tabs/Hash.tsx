import { ccc } from "@ckb-ccc/connector-react";
import { TabProps } from "../types";
import { useState } from "react";
import { Button } from "../components/Button";
import { TextInput } from "../components/Input";

export function Hash({ sendMessage }: TabProps) {
  const [messageToHash, setMessageToHash] = useState<string>("");

  return (
    <div className="mb-1 flex flex-col items-center">
      <TextInput
        className="mb-1 w-9/12"
        placeholder="Message to hash"
        state={[messageToHash, setMessageToHash]}
      />
      <div className="flex">
        <Button
          onClick={async () => {
            sendMessage(
              "Hash:",
              ccc.hashCkb(ccc.bytesFrom(messageToHash, "utf8")),
            );
          }}
        >
          Hash as UTF-8
        </Button>
        <Button
          className="ml-2"
          onClick={async () => {
            sendMessage("Hash:", ccc.hashCkb(messageToHash));
          }}
        >
          Hash as hex
        </Button>
      </div>
    </div>
  );
}
