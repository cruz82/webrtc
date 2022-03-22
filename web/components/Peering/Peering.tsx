import Peer, { DataConnection } from "peerjs";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import getCfg from "next/config";
import { send } from "process";

const { publicRuntimeConfig } = getCfg();

interface IPeeringProps {
  receiverPeerId?: string;
  onOpen?: (peerId: string) => void;
}

export default function Peering({ receiverPeerId, onOpen }: IPeeringProps) {
  const [peerId, setPeerId] = useState<string>();
  const [conn, setConn] = useState<DataConnection>();
  const inputRef = createRef<HTMLInputElement>();
  const [received, setReceived] = useState<string[]>([]);
  const [peers, setPeers] = useState<DataConnection[]>([]);

  const peer = useMemo(() => {
    const p = new Peer(publicRuntimeConfig.peering);
    p.on("open", (id) => {
      setPeerId(id);
      if (onOpen) {
        onOpen(id);
      }
    });

    p.on("connection", (conn) => {
      console.info("New connection", conn);

      setPeers((x) => [...x, conn]);

      conn.on("data", (data) => {
        console.log("Received", data);
        setReceived((x) => [...x, data]);
      });
    });

    return p;
  }, []);

  useEffect(() => {
    if (!peer || !receiverPeerId) {
      return;
    }

    const c = peer.connect(receiverPeerId);
    setPeers((x) => [...x, c]);

    c.on("data", (data) => {
      console.log("Received", data);
      setReceived((x) => [...x, data]);
    });

    return () => {
      c.close();
    };
  }, [peer, receiverPeerId]);

  function sendMsg() {
    if (!inputRef.current) {
      return;
    }

    console.log("send", peers, inputRef.current);

    const msg = inputRef.current.value;
    peers.forEach((c) => c.send(msg));
    inputRef.current.value = "";
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px" }}>
        {receiverPeerId ? "Peer" : "Host"}: {peerId}
      </h1>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          sendMsg();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Message"
          style={{ width: "100%" }}
        />
        <button type="submit">Send</button>
      </form>
      <div>
        {received.map((msg, ix) => {
          return <div key={ix}>{msg}</div>;
        })}
      </div>
    </div>
  );
}
