import { usePeering } from "hooks";

export function Peering() {
  const peer = usePeering();

  return <div>Peer Id: {peer?.id}</div>;
}
