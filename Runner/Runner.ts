import * as mineflayer from "mineflayer";
import { Bot } from "mineflayer";
import {
    BotStateMachine,
    NestedStateMachine,
    StateMachineWebserver,
} from "mineflayer-statemachine";
const chalk = require("chalk");
import { Node } from "../Nodes/Node";
import { Action } from "../Actions/Action";
import { CompileResult } from "../Types/CompileResult";

export function compile(rootNode: Node, bot: Bot): CompileResult {
    let program = rootNode.compile(bot);

    console.log("\n" + rootNode.prettyPrint(0));

    console.log(chalk.green("\nCompilation successful!"));

    if (program.possibleErrors.length > 0) {
        console.log(chalk.yellow("\nUncaught Error(s) could occure in:"));
        program.possibleErrors.forEach((error) => {
            console.log("    " + chalk.red(error.stateName));
        });
        console.log(chalk.yellow("causing the bot to halt, and remain stuck in the same state.\n"));
    }

    return program;
}

export function startBot(rootNode: Node, bot: Bot): void {
    let program = compile(rootNode, bot);

    let transitions = program.transitions;
    let startAction = program.enter;

    let webserver: any;

    bot.on("spawn", () => {
        const NSM = new NestedStateMachine(transitions, startAction);
        const stateMachine = new BotStateMachine(bot, NSM);

        if (!webserver) {
            webserver = new StateMachineWebserver(bot, stateMachine);
            webserver.startServer();
        }

        bot.chat("Hello, I'm LerryBot!");
    });

    bot.on("error", (err) => {
        console.log(err);
    });
}
