import { libs } from "./sunmao/lib";
import registerSunmaoEditor from "./SunmaoEditor";
import "@sunmao-ui/editor/dist/index.css";
import "./init";

function VisualEditor() {
  const PageEditor = registerSunmaoEditor({ name: "logging" }, { libs });

  return <PageEditor />;
}

export default VisualEditor;
