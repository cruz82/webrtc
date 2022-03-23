import Peer, { DataConnection } from "peerjs";
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import getCfg from "next/config";

interface IData {
  type: "msg" | "ping" | "pong";
  payload: any;
}

const { publicRuntimeConfig } = getCfg();

export default function Chat() {
  const [peerId, setPeerId] = useState<string>();
  const inputRef = createRef<HTMLInputElement>();
  const [msgs, setMsgs] = useState<{ sender: string; msg: string }[]>([]);
  const [peers, setPeers] = useState<DataConnection[]>([]);
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [streams, setStreams] = useState<Record<string, MediaStream>>({});
  const [pings, setPings] = useState<Record<string, number>>({});

  const peer = useMemo(() => {
    console.log("Creating peer");
    const p = new Peer(publicRuntimeConfig.peering);
    p.on("open", (id) => {
      setPeerId(id);
    });

    p.on("connection", (conn) => {
      console.log(`Incoming connection: `, conn);

      setPeers((x) => [...x, conn]);

      conn.on("data", (data: IData) => {
        switch (data.type) {
          case "msg":
            setMsgs((prev) => [
              ...prev,
              { sender: conn.peer, msg: data.payload },
            ]);
            break;
          case "ping":
            conn.send({ type: "pong", payload: data.payload });
            break;
          case "pong":
            setPings((prev) => ({
              ...prev,
              [conn.peer]: new Date().getTime() - data.payload,
            }));
        }
      });
    });

    p.on("call", async (call) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const self = selfVideoRef.current;
      if (self) {
        self.srcObject = stream;
        self.play();
      }

      call.answer(stream);
      call.on("stream", (remoteStream) => {
        setStreams((prev) => ({ ...prev, [call.peer]: remoteStream }));
      });
    });

    return p;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const connectedPeers = peers.filter((x) => x.open);
      connectedPeers.forEach((conn) =>
        conn.send({ type: "ping", payload: new Date().getTime() })
      );
      setPeers(connectedPeers);
    }, 5000);

    return () => clearInterval(interval);
  }, [peers]);

  async function connect(connectId: string) {
    if (!peer) {
      return;
    }

    const conn = peer.connect(connectId);
    setPeers((prev) => [...prev.filter((x) => x.open), conn]);

    conn.on("data", (data: IData) => {
      switch (data.type) {
        case "msg":
          setMsgs((prev) => [
            ...prev,
            { sender: conn.peer, msg: data.payload },
          ]);
          break;
        case "ping":
          conn.send({ type: "pong", payload: data.payload });
          break;
        case "pong":
          setPings((prev) => ({
            ...prev,
            [conn.peer]: new Date().getTime() - data.payload,
          }));
      }
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const self = selfVideoRef.current;
    if (self) {
      self.srcObject = stream;
      self.play();
    }

    const call = peer.call(connectId, stream);
    call.on("stream", (remoteStream) => {
      setStreams((prev) => ({ ...prev, [call.peer]: remoteStream }));
    });
  }

  function sendMsg() {
    if (!inputRef.current) {
      return;
    }

    const msg = inputRef.current.value;
    console.log(`Sending: `, msg, peers);
    const connectedPeers = peers.filter((x) => x.open);
    connectedPeers.forEach((c) => c.send(msg));
    setMsgs((prev) => [...prev, { sender: peer.id, msg }]);
    inputRef.current.value = "";
  }

  return (
    <div>
      <h1>Address: {peerId}</h1>
      <video ref={selfVideoRef} width="150" />
      <h2>Connected:</h2>
      <ul>
        {peers.map((c) => {
          return (
            <li
              key={c.peer}
              style={{
                listStyle: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <video
                width="150"
                ref={(el) => {
                  if (!el) {
                    return;
                  }

                  el.srcObject = streams[c.peer];
                }}
                autoPlay
              />
              <div>
                <div>{c.peer}</div>
                <div>Ping: {pings[c.peer]}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          const form = ev.target as HTMLFormElement;
          const input = form.getElementsByTagName("input")[0];
          const addr = input.value.trim();
          input.value = "";
          connect(addr);
        }}
      >
        <input ref={inputRef} type="text" placeholder="Address" />
        <button type="submit">Connect</button>
      </form>

      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          sendMsg();
        }}
      >
        <input ref={inputRef} type="text" placeholder="Message" />
        <button type="submit">Send</button>
      </form>
      <div style={{ padding: "8px" }}>
        <h2>Chat</h2>
        {msgs.map((m, ix) => {
          return (
            <div
              key={ix}
              style={{
                fontFamily: "monospace",
                color: m.sender === peer.id ? "grey" : "inherit",
              }}
            >
              {m.sender.slice(0, 8)}: {m.msg}
            </div>
          );
        })}
      </div>
    </div>
  );
}
