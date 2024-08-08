import { useState } from "react";
import { TabProps } from "../types";
import { TextInput } from "../components/Input";
import { Button } from "../components/Button";
import { ccc } from "@ckb-ccc/connector-react";
import { SelectInput } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { bytifyRawString, createCluster, createSpore } from "@spore-sdk/core";
import { bytes, number } from "@ckb-lumos/codec";

type Pattern = {
  name: string;
  type: "string" | "number";
  /// offset: number = pattern index
  /// len
  // if pattern = options => len = 1
  // if pattern = range, utf8, raw => len = bytes len
  len: number;
  pattern: "options" | "range" | "utf8" | "raw";
  args?: (number | string)[];
};

const DEFAULT_PATTERN: Pattern = {
  name: "image",
  type: "string",
  len: 128,
  pattern: "utf8",
};

export function MintSpore({ sendMessage, signer }: TabProps) {
  const [clusterName, setClusterName] = useState<string>("");
  const [clusterDesc, setClusterDesc] = useState<string>("");
  const [clusterLock, setClusterLock] = useState<"Private" | "Public">(
    "Private",
  );

  const [sporeDna, setSporeDna] = useState<string>("");
  const [clusterId, setClusterId] = useState<string>("");
  const [patterns, setPatterns] = useState<Pattern[]>([
    {
      name: "prev.type",
      type: "string",
      len: 1,
      pattern: "options",
      args: ["image"],
    },
    {
      name: "prev.bg",
      type: "string",
      len: 128,
      pattern: "utf8",
    },
  ]);

  const addPattern = () => {
    setPatterns((_patterns) => {
      return [..._patterns, DEFAULT_PATTERN];
    });
  };

  const removePattern = (patterIndex: number) => {
    setPatterns((_patterns) => {
      _patterns.splice(patterIndex, 1);
      return [..._patterns];
    });
  };

  const setPatternField = (
    field: "name" | "type" | "pattern" | "args",
    index: number,
    value: string,
  ) => {
    setPatterns((_patterns) => {
      if (field === "args") {
        _patterns[index][field] = JSON.parse(value) as number[];
      } else {
        // @ts-ignore
        _patterns[index][field] = value;
      }
      return [..._patterns];
    });
  };

  const _createCluster = async () => {
    if (!signer) {
      return;
    }

    const dobMetadata = {
      description: clusterDesc,
      dob: {
        ver: 0,
        decoder: {
          type: "code_hash",
          hash: "0x1c84212ebd817e9de09d2a79f85cc421b684eda63409cfa75688f98716e77b5f", // Universal Decoder Deployments
        },
        pattern: patterns.map((_pattern, index) => {
          const patternArr: (number | string | (number | string)[])[] = [
            _pattern.name,
            _pattern.type,
            index,
            _pattern.len,
            _pattern.pattern,
          ];

          if (_pattern.args) {
            patternArr.push(_pattern.args);
          }

          return patternArr;
        }),
      },
    };

    // Assume minCkb = 0
    const addressObj = await signer.getRecommendedAddressObj();
    const blake160 = addressObj.script.args;
    const minimalCkb = bytes.hexify(number.Uint8.pack(0));
    const publicLock = await ccc.Script.fromKnownScript(
      signer.client,
      ccc.KnownScript.AnyoneCanPay,
      `${blake160}${minimalCkb.slice(2)}`, // minimalCkb
    );

    const { txSkeleton } = await createCluster({
      data: {
        name: clusterName,
        description: JSON.stringify(dobMetadata),
      },
      fromInfos: [addressObj.toString()],
      toLock: clusterLock === "Public" ? publicLock : addressObj.script,
    });

    const createClusterTx = ccc.Transaction.fromLumosSkeleton(txSkeleton);

    sendMessage(
      "Transaction sent:",
      await signer.sendTransaction(createClusterTx),
    );
  };
  const _createSpore = async () => {
    if (!signer || !sporeDna) {
      return;
    }

    const dobContent = {
      dna: sporeDna,
    };

    const addressObj = await signer.getRecommendedAddressObj();
    const { txSkeleton } = await createSpore({
      data: {
        contentType: "dob/0",
        content: bytifyRawString(JSON.stringify(dobContent)),
        clusterId: clusterId === "" ? undefined : clusterId,
      },
      fromInfos: [addressObj.toString()],
      toLock: addressObj.script,
    });

    const createClusterTx = ccc.Transaction.fromLumosSkeleton(txSkeleton);

    sendMessage(
      "Transaction sent:",
      await signer.sendTransaction(createClusterTx),
    );
  };

  return (
    <>
      <div className="mb-1 flex flex-col items-center">
        <div className="flex w-9/12 flex-col items-center">
          <b>1. Create Spore Cluster</b>
          <TextInput
            className="mt-1 w-full"
            placeholder="Name"
            state={[clusterName, setClusterName]}
          />
          <TextInput
            className="mt-1 w-full"
            placeholder="Description"
            state={[clusterDesc, setClusterDesc]}
          />
          <label className="mb-2 block text-sm font-medium">Lock Type</label>
          <SelectInput
            className="mt-1 h-fit"
            state={[
              clusterLock,
              (value) => {
                setClusterLock(value as "Private" | "Public");
              },
            ]}
            options={[
              {
                label: "Public",
                value: "Public",
              },
              {
                label: "Private",
                value: "Private",
              },
            ]}
          />
          <div className="m-4 rounded border-4 p-4">
            <h5>Patterns - NFT traits</h5>
            <Button onClick={addPattern}>Add new Pattern</Button>
            {patterns.map((_pattern, index) => (
              <div className="flex items-end gap-2" key={index}>
                <TextInput
                  className="mt-1 h-fit"
                  placeholder="Name"
                  state={[
                    _pattern.name,
                    (value) => {
                      setPatternField("name", index, value);
                    },
                  ]}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium">Type</label>
                  <SelectInput
                    className="mt-1 h-fit"
                    state={[
                      _pattern.type,
                      (value) => {
                        setPatternField("type", index, value);
                      },
                    ]}
                    options={[
                      {
                        label: "string",
                        value: "string",
                      },
                      {
                        label: "number",
                        value: "number",
                      },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Pattern
                  </label>
                  <SelectInput
                    className="mt-1 h-fit"
                    state={[
                      _pattern.pattern,
                      (value) => {
                        setPatternField("pattern", index, value);
                      },
                    ]}
                    options={[
                      {
                        label: "options",
                        value: "options",
                      },
                      {
                        label: "range",
                        value: "range",
                      },
                      {
                        label: "utf8",
                        value: "utf8",
                      },
                      {
                        label: "raw",
                        value: "raw",
                      },
                    ]}
                  />
                </div>
                {/* TODO args based on pattern and type */}
                <Button onClick={() => removePattern(index)} className="py-1">
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-1" onClick={_createCluster}>
            Create Cluster
          </Button>
        </div>

        <hr className="my-8 h-px w-full border-2 " />

        <div className="flex w-9/12 flex-col items-center">
          <b>2. Create Spore `dob/0` NFTs</b>
          <TextInput
            className="mt-1 w-full"
            placeholder="ClusterId"
            state={[clusterId, setClusterId]}
          />
          <Textarea
            className="mt-1 w-full"
            placeholder="Spore DNA"
            state={[sporeDna, setSporeDna]}
          />
          <Button className="mt-1" onClick={_createSpore}>
            Create Spore
          </Button>
        </div>
      </div>

      <hr className="my-8 h-px w-full border-2 " />
    </>
  );
}
