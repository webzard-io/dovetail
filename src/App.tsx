import { libs } from "./sunmao/lib";
import registerSunmaoApp from "./SunmaoApp";
import schema from "./sunmao/schema.json";
import type { Schema } from "./types";
import "./init";

function App() {
  const Page = registerSunmaoApp(schema as Schema, libs);

  return <Page />;
}

export default App;
