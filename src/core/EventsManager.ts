import EventsManager from "@includes/EventsManager";
import Connection from "./Connection";

const EM = new EventsManager(Connection);

EM.setEventListeners();

export default EM;