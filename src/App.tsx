import { libs, dependencies } from "./sunmao/lib";
import registerSunmaoApp from "./SunmaoApp";
import lcm from "./sunmao/lcm.json";
import fiddle from "./sunmao/fiddle.json";
import yzFiddle from "./sunmao/yz-fiddle.json";
import kgt from "./sunmao/kgt.json";
import deployment from "./sunmao/deployment.json";
import type { Schema } from "./types";
import "./i18n";

function App() {
  const search = new URLSearchParams(location.search);
  const schema = (
    {
      fiddle,
      lcm,
      yzFiddle,
      kgt,
      deployment,
    } as Record<string, Schema>
  )[search.get("app") || "fiddle"];
  const Page = registerSunmaoApp(schema, {
    libs,
    dependencies,
  });

  return <Page />;
}

export default App;
