import { Kit } from "../theme-context";
import Button from "./components/Button/Button";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import Sidebar from "./components/Sidebar/Sidebar";
import Tag from "./components/Tag/Tag";

import "antd/dist/antd.less";
import "./styles/font.scss";

export const kit: Kit = {
  name: "CloudTower",
  Button,
  Table,
  Loading,
  Sidebar,
  Tag,
};
