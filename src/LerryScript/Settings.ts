const minecraftData = require("minecraft-data");

const VERSION = "1.17";
const ENABLE_BOT_DEBUG = true;
const PRINT_STATES = false;
const PRINT_ERROR = true;

const mcData = minecraftData(VERSION);

export { mcData, ENABLE_BOT_DEBUG, PRINT_STATES, PRINT_ERROR };
