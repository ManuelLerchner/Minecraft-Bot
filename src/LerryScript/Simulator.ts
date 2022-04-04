import { Bot } from "mineflayer";
import {
    BotStateMachine,
    NestedStateMachine,
    StateMachineWebserver,
} from "mineflayer-statemachine";

import { ASTNode } from "./Nodes/ASTNodes/ASTNode";
import { compile } from "./Compiler";
import { pathfinder } from "mineflayer-pathfinder";
import { CompileResult } from "./Types/CompileResult";
import { ENABLE_BOT_DEBUG } from "./Settings";

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

        bot.on("chat", (username, message) => {
            if (message === "drop items") {
                bot.chat("dropping items");
                (function tossNext() {
                    if (bot.inventory.items().length === 0) return;
                    const item = bot.inventory.items()[0];
                    bot.tossStack(item);
                    tossNext();
                })();
            }
        });
    }
}
