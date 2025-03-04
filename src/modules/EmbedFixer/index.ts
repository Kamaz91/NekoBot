//import cfg from "./config.js";
import EventsManager from "../../core/EventsManager.js";
import { Events } from "discord.js";
import "./embedFixer.js";
import { ModuleBuilder } from "../../utils/index.js"
import logger from "../../services/logger/index.js";
import ModuleManager from "../../core/ModuleManager.js";

import { processMessage } from "./embedFixer.js";

const module = new ModuleBuilder();

//module.setConfig(cfg.sql, cfg.template, cfg.prepareData);
module.setExecute(() => {
    logger?.info("[Embed Fixer] module loaded");
    EventsManager.addEventTask(Events.MessageCreate, processMessage);
});

ModuleManager.addModule("EmbedFixer", module.cfg, module.execute);

export default module;

// [object URL] {
//     hash: "",
//     host: "d.ddinstagram.com",
//     hostname: "d.ddinstagram.com",
//     href: "https://d.ddinstagram.com/reel/DGBG-m4oB-0/?igsh=dXdyOGptbG1qemlp",
//     origin: "https://d.ddinstagram.com",
//     password: "",
//     pathname: "/reel/DGBG-m4oB-0/",
//     port: "",
//     protocol: "https:",
//     search: "?igsh=dXdyOGptbG1qemlp",
//     searchParams: [object URLSearchParams] {
//       append: function append() {
//         [native code]
//   },
//       delete: function delete() {
//         [native code]
//   },
//       entries: function entries() {
//         [native code]
//   },
//       forEach: function forEach() {
//         [native code]
//   },
//       get: function get() {
//         [native code]
//   },
//       getAll: function getAll() {
//         [native code]
//   },
//       has: function has() {
//         [native code]
//   },
//       keys: function keys() {
//         [native code]
//   },
//       set: function set() {
//         [native code]
//   },
//       size: 1,
//       sort: function sort() {
//         [native code]
//   },
//       toString: function toString() {
//         [native code]
//   },
//       values: function values() {
//         [native code]
//   }
//     },
//     toJSON: function toJSON() {
//       [native code]
//   },
//     toString: function toString() {
//       [native code]
//   },
//     username: ""
//   }