import { Kit } from "../theme-context";
import Button from "./components/Button/Button";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import Sidebar from "./components/Sidebar/Sidebar";
import Tag from "./components/Tag/Tag";
import Modal from "./components/Modal/Modal";

import "antd/dist/antd.less";
import "./styles/font.scss";
import "./styles/override.scss";

export const kit: Kit = {
  name: "CloudTower",
  Button,
  Table,
  Loading,
  Sidebar,
  Tag,
  Modal,
};
