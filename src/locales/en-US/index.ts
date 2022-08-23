import i18next from "i18next";
import dovetail from "./dovetail.json";

if (import.meta.env.PROD) {
  i18next.addResourceBundle("en-US", "dovetail", dovetail);
}

export default {
  dovetail,
};
