import React from "react";

class Registry {
  public icons: Map<string, React.ReactNode> = new Map();

  registerIcon(name: string, icon: React.ReactNode): void {
    if (this.icons.has(name)) {
    } else {
      this.icons.set(name, icon);
    }
  }
}

const registry = new Registry();

export default registry;
