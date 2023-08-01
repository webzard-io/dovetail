import { libs as K8sLib } from "./sunmao/lib";
import "./locales";
import i18nInstance from "./i18n";
import registry from "./services/Registry";

export * from "./sunmao/utils/storage";
export { KubeApi } from "./_internal/k8s-api-client/kube-api";
export { K8sLib };
export { registry };
export { i18nInstance };
