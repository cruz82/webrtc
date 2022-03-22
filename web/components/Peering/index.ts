import dynamic from "next/dynamic";

export const Peering = dynamic(() => import("./Peering"), { ssr: false });
