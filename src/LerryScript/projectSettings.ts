const minecraftData = require("minecraft-data");

const VERSION = "1.17";
const mcData = minecraftData(VERSION);

const DEBUG = true;
const PRINT_CURRENT_STATE = false;

export { mcData, DEBUG, PRINT_CURRENT_STATE as PRINT_STATES };
