import { ClientOnly, Peering } from "components";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <ClientOnly>
      <Peering />
    </ClientOnly>
  );
};

export default Home;
