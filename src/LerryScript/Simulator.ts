import { Bot } from "mineflayer";
import {
    BotStateMachine,
    NestedStateMachine,
    StateMachineWebserver,
} from "mineflayer-statemachine";

import { ASTNode } from "./Nodes/ASTNodes/ASTNode";
import { compile } from "./Compiler";
import { Movements, pathfinder } from "mineflayer-pathfinder";
import { CompileResult } from "./Types/CompileResult";
import { ENABLE_BOT_DEBUG, mcData } from "./Settings";

export function simulate(rootNode: ASTNode, bot: Bot): void {
    bot.loadPlugin(pathfinder);

    let program = compile(rootNode, bot);
    let webserver = null;

    startBot(bot, program, webserver);
}

function startBot(bot: Bot, program: CompileResult, webserver: StateMachineWebserver | null): void {
    bot.on("spawn", () => {
        const NSM = new NestedStateMachine(program.transitions, program.enter);
        const stateMachine = new BotStateMachine(bot, NSM);

        const mcData = require("minecraft-data")(bot.version);

        const movements = new Movements(bot, mcData);
        movements.scafoldingBlocks.push(mcData.itemsByName["oak_log"].id);
        bot.pathfinder.setMovements(movements);

        if (!webserver) {
            webserver = new StateMachineWebserver(bot, stateMachine);
            webserver.startServer();
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
                bot.chat("dropping items");

                for (let item of bot.inventory.items()) {
                    await bot.tossStack(item);
                }
            }

            if (message === "restart") {
            }
        });
    }
}
