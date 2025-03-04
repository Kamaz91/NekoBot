import EventsManager from "../includes/EventsManager.class.js";
import Connection from "./Connection.js";

const EM = new EventsManager(Connection);

EM.setEventListeners();

export default EM;