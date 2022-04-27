import { useEffect } from "react";
import { libs } from "./sunmao/lib";
import registerSunmaoApp from "./SunmaoApp";
import schema from "./sunmao/schema.json";
import type { Schema } from "./types";
import "./init";
import { KubeApi } from "./_internal/k8s-api/kube-api";
import type { NamespaceList } from "kubernetes-types/core/v1";

function App() {
  const Page = registerSunmaoApp(schema as Schema, libs);

  useEffect(() => {
    const api = new KubeApi<NamespaceList>({
      objectConstructor: {
        kind: "Namespace",
        namespaced: false,
        apiBase: "/api/v1/namespaces",
      },
    });
    api
      .list({ query: { fieldSelector: "metadata.name=kube-node-lease" } })
      .then((res) => console.log(res.items[0].status))
      .catch(console.error);
  }, []);

  return <Page />;
}

export default App;
