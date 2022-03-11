import Peer from "peerjs";
import { useState } from "react";

const peerInstance = typeof window !== "undefined" ? new Peer() : undefined;

export function usePeering() {
  const [peer, setPeer] = useState<Peer>();
  peerInstance?.on("open", () => setPeer(peer));

  return peer;
}
