import { exposeOnWindow } from "./Helper.js";

let urlParams = new URLSearchParams(window.location.search);

const DebugMode = {
    enabled: urlParams.get("debug")
};

exposeOnWindow("DebugMode", DebugMode);

export default DebugMode;
