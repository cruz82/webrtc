import dynamic from "next/dynamic";

export const ClientOnly = dynamic(() => import("./ClientOnly"), { ssr: false });
