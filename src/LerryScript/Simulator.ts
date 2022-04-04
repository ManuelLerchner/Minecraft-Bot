import { Bot } from "mineflayer";
import {
    BotStateMachine,
    NestedStateMachine,
    StateMachineWebserver,
} from "mineflayer-statemachine";

import { Node } from "./Nodes/Nodes";
import { compile } from "./Compiler";
import { pathfinder } from "mineflayer-pathfinder";
import { CompileResult } from "./Types/CompileResult";

export function simulate(rootNode: Node, bot: Bot): void {
    bot.loadPlugin(pathfinder);

    let program = compile(rootNode, bot);
    let webserver = null;

    startBot(bot, program, webserver);
}

function startBot(bot: Bot, program: CompileResult, webserver: StateMachineWebserver | null): void {
    bot.on("spawn", () => {
        bot.chat("Hello, I'm LerryBot!");

        const NSM = new NestedStateMachine(program.transitions, program.enter);
        const stateMachine = new BotStateMachine(bot, NSM);

        if (!webserver) {
            webserver = new StateMachineWebserver(bot, stateMachine);
            webserver.startServer();
        }
    });

    bot.on("death", () => {
        bot.chat("I died!");
    });

    bot.on("error", (err) => {
        console.log(err);
    });
}
