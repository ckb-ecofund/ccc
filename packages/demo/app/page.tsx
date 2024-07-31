"use client";

import { ccc } from "@ckb-ccc/connector-react";
import Home from "./home";

export default function Root() {
  return (
    <ccc.Provider
    /*
      defaultClient={new ccc.ClientPublicTestnet()} // Default client used by connector
      connectorProps={{ style: { backgroundColor: "#f00" } }} // Custom props on the connector element
      name="Custom name" // Custom name for your application, default to website title
      icon="https://custom.icon" // Custom icon for your application, default to website icon
      signerFilter={async (signerInfo, wallet) => true} // Filter out signers that you don't want
      preferredNetworks={[
        {
          addressPrefix: "ckt",
          signerType: ccc.SignerType.BTC,
          network: "btc",
        },
      ]} //
    */
    >
      <Home />
    </ccc.Provider>
  );
}
