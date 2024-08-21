"use client";

import { useApp } from "@/src/context";
import { Button } from "@/src/components/Button";
import { useState } from "react";
import { TextInput } from "@/src/components/Input";
import { ccc } from "@ckb-ccc/connector-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { setPrivateKeySigner } = useApp();
  const { client } = ccc.useCcc();
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div className="flex w-9/12 flex-col items-center items-stretch gap-2">
      <TextInput
        label={<span className="font-bold">Private Key</span>}
        state={[privateKey, setPrivateKey]}
        placeholder="0x0123456789..."
      />
      <div className="flex justify-center">
        <Button onClick={() => router.push("/")}>Back</Button>
        <Button
          className="ml-2"
          onClick={() => {
            try {
              setPrivateKeySigner(
                new ccc.SignerCkbPrivateKey(client, privateKey),
              );
              router.push("/connected");
            } catch (_) {
              setPrivateKeySigner(undefined);
              Promise.reject("Invalid private key");
            }
          }}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
