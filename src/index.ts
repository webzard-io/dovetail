import { libs as K8sLib } from "./sunmao/lib";
import "./locales";
import registry from "./services/Registry";

export { KubeApi } from "./_internal/k8s-api-client/kube-api"
export { K8sLib };
export { registry };
