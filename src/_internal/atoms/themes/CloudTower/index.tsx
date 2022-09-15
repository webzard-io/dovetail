import { Kit } from "../../kit-context";
import { shared } from "../../kit-shared";
import Button from "./components/Button/Button";
import Table from "./components/Table/Table";
import Loading from "./components/Loading/Loading";
import Sidebar from "./components/Sidebar/Sidebar";
import Tag from "./components/Tag/Tag";
import Modal from "./components/Modal/Modal";
import FullscreenModal from "./components/FullscreenModal/Modal";
import Card from "./components/Card";
import InfoRow from "./components/InfoRow";
import TabMenu from "./components/TabMenu";
import Checkbox from "./components/Checkbox/Checkbox";
import Input from "./components/Input/Input";
import InputNumber from "./components/InputNumber/InputNumber";
import { Dropdown } from "antd";
import Pagination from "./components/Pagination/Pagination";
import Select from "./components/Select/Select";
import Switch from "./components/Switch/Switch";

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
  FullscreenModal,
  Card,
  InfoRow,
  TabMenu,
  Checkbox,
  Dropdown: (props) => {
    return <Dropdown {...props} />;
  },
  Pagination,
  Input,
  InputNumber,
  Select,
  Switch,
};
