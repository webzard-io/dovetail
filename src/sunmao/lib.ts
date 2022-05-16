import { SunmaoLib } from "@sunmao-ui/runtime";
import { Root } from "./components/Root";
import { Button } from "./components/Button";
import { UnstructuredTable } from "./components/UnstructuredTable";
import { ObjectAge } from "./components/ObjectAge";

export const libs: SunmaoLib[] = [
  {
    traits: [],
    components: [Root, Button, UnstructuredTable, ObjectAge],
  },
];
