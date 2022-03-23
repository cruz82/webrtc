import dynamic from "next/dynamic";

export const Chat = dynamic(() => import("./Chat"), { ssr: false });
