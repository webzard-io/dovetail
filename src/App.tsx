import { libs } from "./sunmao/lib";
import registerSunmaoApp from "./SunmaoApp";
import lcm from "./sunmao/lcm.json";
import fiddle from "./sunmao/fiddle.json";
import yzFiddle from "./sunmao/yz-fiddle.json";
import kgt from "./sunmao/kgt.json";
import deployment from "./sunmao/deployment.json";
import validation from "./sunmao/validation.json";
import type { Schema } from "./types";
import "./i18n";
import "antd/dist/antd.css";
import "@cloudtower/eagle/dist/style.css";


function App() {
  const search = new URLSearchParams(location.search);
  const schema = (
    {
      fiddle,
      lcm,
      yzFiddle,
      kgt,
      deployment,
      validation,
    } as Record<string, Schema>
  )[search.get("app") || "fiddle"];
  const Page = registerSunmaoApp(schema, {
    libs,
  });

  return <Page />;
}

export default App;
