import { libs } from "./sunmao/lib";
import registerSunmaoEditor from "./SunmaoEditor";
import "@sunmao-ui/editor/dist/index.css";
import "./i18n";

function VisualEditor() {
  const search = new URLSearchParams(location.search);
  const PageEditor = registerSunmaoEditor(
    { name: search.get("app") || "fiddle" },
    { libs }
  );

  return <PageEditor />;
}

export default VisualEditor;
