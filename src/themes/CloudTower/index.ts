import { Kit } from "../theme-context";
import Button from "./components/Button/Button";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";

import "antd/dist/antd.less";
import "./styles/font.scss";

export const kit: Kit = {
  name: "CloudTower",
  Button,
  Table,
  Loading,
};
