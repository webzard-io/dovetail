import { Kit } from "../../kit-context";
import { shared } from "../../kit-shared";
import Button from "./components/Button/Button";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import Sidebar from "./components/Sidebar/Sidebar";
import Tag from "./components/Tag/Tag";
import Modal from "./components/Modal/Modal";

import "./styles/font.scss";
import "./styles/override.scss";

export const kit: Kit = {
  ...shared,
  name: "CloudTower",
  Button: Button as Kit["Button"],
  Table: Table as Kit["Table"],
  Loading,
  Sidebar,
  Tag,
  Modal,
};
