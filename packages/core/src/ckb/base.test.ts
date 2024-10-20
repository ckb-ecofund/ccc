import { bytesFrom } from "../barrel.js";
import { HashType } from "../ckb/script.js";
import { Hex } from "../hex/index.js";
import { Base, extendsBase } from "./base.js";

test("base", () => {
  class Script extends Base {
    constructor(
      public codeHash: Hex,
      public hashType: HashType,
      public args: Hex,
    ) {
      super();
    }
  }

  const bytesToConstructorParams = jest.fn(
    (): ConstructorParameters<typeof Script> => ["0x", "type", "0x"],
  );

  const instanceToBytes = jest.fn(() => []);

  const ScriptCCCModel = extendsBase(
    Script,
    bytesToConstructorParams,
    instanceToBytes,
  );
  expect(ScriptCCCModel.name).toBe("ScriptCCCModel");

  const script1 = ScriptCCCModel.fromBytes("0x");
  const script2 = new ScriptCCCModel("0x", "type", "0x");

  expect(script1).toBeInstanceOf(ScriptCCCModel);
  expect(bytesToConstructorParams).toHaveBeenCalledWith(bytesFrom("0x"));

  expect(script2.eq(script1)).toBe(true);
  expect(script2.hash()).toMatch(/^0x.[64]/);

  expect(Uint8Array.from(script2.toBytes())).toEqual(
    Uint8Array.from(bytesFrom("0x")),
  );
});
