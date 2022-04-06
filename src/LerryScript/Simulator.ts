import { Bot } from "mineflayer";
import {
    BotStateMachine,
    NestedStateMachine,
    StateMachineWebserver,
} from "mineflayer-statemachine";
import { ASTNode } from "./Nodes/ASTNodes/ASTNode";
import { compile } from "./Compiler";
import { CompileResult } from "./Types/CompileResult";
import { ENABLE_BOT_DEBUG, mcData } from "./Settings";

import { Movements, pathfinder } from "mineflayer-pathfinder";

const autoeat = require("mineflayer-auto-eat");
const inventoryViewer = require("mineflayer-web-inventory");

export function simulate(rootNode: ASTNode, bot: Bot): void {
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(autoeat);

    let program = compile(rootNode, bot);
    let webserver = null;

    startBot(bot, program, webserver);
}

function startBot(bot: Bot, program: CompileResult, webserver: StateMachineWebserver | null): void {
    bot.on("spawn", () => {
        const NSM = new NestedStateMachine(program.transitions, program.enter);
        const stateMachine = new BotStateMachine(bot, NSM);

        const movements = new Movements(bot, mcData);
        movements.scafoldingBlocks.push(mcData.itemsByName["oak_log"].id);
        bot.pathfinder.setMovements(movements);

        if (!webserver) {
            webserver = new StateMachineWebserver(bot, stateMachine);
            inventoryViewer(bot, {
                port: 8935,
                startOnLoad: true,
            });
            webserver.startServer();

            console.log("Started inventory server at http://localhost:8935.");
        }
    });

    if (ENABLE_BOT_DEBUG) {
        bot.on("spawn", () => {
            bot.chat("DEBUG MODE: ON");
        });

        bot.on("error", (err) => {
            console.log(err);
        });

        bot.on("chat", async (username, message) => {
            if (message === "drop items") {
                for (let item of bot.inventory.items()) {
                    await bot.tossStack(item);
                }
            }

            if (message === "food") {
                bot.chat(bot.food.toString());
            }

            if (message === "health") {
                bot.chat(bot.health.toString());
            }
        });
    }
}
