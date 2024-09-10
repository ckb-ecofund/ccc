import { Decoder, PatternElementDob0, PatternElementDob1 } from "./object.js";

export function checkDecoder(decoder: Decoder) {
  if (decoder.type === "code_hash" || decoder.type === "type_id") {
    if (decoder.hash === undefined) {
      throw new Error(
        "Invalid decoder: 'hash' is required for 'code_hash' and 'type_id'",
      );
    }
  }
  if (decoder.type === "type_script" && decoder.script === undefined) {
    throw new Error("Invalid decoder: 'script' is required for 'type_script'");
  }
}

export function checkPatternDob0(value: PatternElementDob0) {
  switch (value.patternType) {
    case "options": {
      if (value.traitArgs === undefined) {
        throw new Error(
          "Invalid pattern: 'traitArgs' is required for 'options'",
        );
      }
      if (value.traitArgs.length === 0) {
        throw new Error(
          "Invalid pattern: 'traitArgs' should not be empty for 'options'",
        );
      }
      break;
    }
    case "range": {
      if (value.traitArgs === undefined) {
        throw new Error("Invalid pattern: 'traitArgs' is required for 'range'");
      }
      if (
        value.traitArgs.length !== 2 ||
        value.traitArgs.filter((v) => typeof v === "number").length !== 2
      ) {
        throw new Error(
          "Invalid pattern: 'traitArgs' should contain exactly 2 numbers for 'range'",
        );
      }
      break;
    }
  }
  if (value.dnaLength === 0) {
    throw new Error("Invalid pattern: 'dnaLength' should be greater than 0");
  }
}

export function checkPatternDob1(value: PatternElementDob1) {
  switch (value.patternType) {
    case "options": {
      if (!Array.isArray(value.traitArgs)) {
        throw new Error(
          "Invalid pattern: 'traitArgs' should be an array for 'options'",
        );
      }
      for (const args of value.traitArgs) {
        if (args.length !== 2) {
          throw new Error(
            "Invalid pattern: 'traitArgs' should contain exactly 2 elements for 'options'",
          );
        }
        if (typeof args[0] !== "string") {
          if (!Array.isArray(args[0])) {
            throw new Error(
              "Invalid pattern: 'traitArgs[0]' should be a string or an array that contains only 2 numbers or the '*' for 'options'",
            );
          }
          if (args[0].length === 1 && args[0][0] !== "*") {
            throw new Error(
              "Invalid pattern: 'traitArgs[0]' should be a string or an array that contains only 2 numbers or the '*' for 'options'",
            );
          }
          if (
            args[0].length === 2 &&
            (typeof args[0][0] !== "number" || typeof args[0][1] !== "number")
          ) {
            throw new Error(
              "Invalid pattern: 'traitArgs[0]' should be a string or an array that contains only 2 numbers or the '*' for 'options'",
            );
          }
          if (args[0].length === 0 || args[0].length > 2) {
            throw new Error(
              "Invalid pattern: 'traitArgs[0]' should be a string or an array that contains only 2 numbers or the '*' for 'options'",
            );
          }
        }
        if (typeof args[1] !== "string") {
          throw new Error(
            "Invalid pattern: 'traitArgs[1]' should be a string for 'options'",
          );
        }
      }
      break;
    }
    case "raw": {
      if (value.traitName !== "" || typeof value.traitArgs !== "string") {
        throw new Error(
          "Invalid pattern: 'traitName' should be empty and 'traitArgs' should be a string for 'raw'",
        );
      }
      break;
    }
  }
}
