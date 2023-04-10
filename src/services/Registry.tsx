import React from "react";
import { RuleItem } from "async-validator";
import { ipv4, email, url, dnsSubdomain, rfc1035, rfc1123 } from "../sunmao/utils/validators";

class Registry {
  public icons: Map<string, React.ReactNode> = new Map();
  public validators: Map<string, RuleItem["validator"]> = new Map();

  registerIcon(name: string, icon: React.ReactNode): void {
    if (this.icons.has(name)) {
      throw new Error("[Dovetail]: The icon name is exist.");
    } else {
      this.icons.set(name, icon);
    }
  }

  registerValidator(name: string, validator: RuleItem["validator"]): void {
    if (this.validators.has(name)) {
      throw new Error("[Dovetail]: The validator name is exist.");
    } else {
      this.validators.set(name, validator);
    }
  }
}

const registry = new Registry();

registry.registerValidator("ipv4", ipv4);
registry.registerValidator("email", email);
registry.registerValidator("url", url);
registry.registerValidator("dnsSubdomain", dnsSubdomain);
registry.registerValidator("rfc1035", rfc1035);
registry.registerValidator("rfc1123", rfc1123);

export default registry;
