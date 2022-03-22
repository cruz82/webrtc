import { Receiver, Caller, Peering } from "components";
import type { NextPage } from "next";
import { useState } from "react";

const Home: NextPage = () => {
  const [receiverPeerId, setReceiverPeerId] = useState("");

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
        gap: "20px",
      }}
    >
      <Peering receiverPeerId={receiverPeerId} />
      <Peering receiverPeerId={receiverPeerId} />
      <Peering onOpen={setReceiverPeerId} />
    </div>
  );
};

export default Home;
