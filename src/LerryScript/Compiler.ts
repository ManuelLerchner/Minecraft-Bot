import chalk from "chalk";
import { Bot } from "mineflayer";
import { Node } from "./Nodes/Nodes";

import { Action } from "./Actions/Action";
import { CompileResult } from "./Types/CompileResult";

export function compile(rootNode: Node, bot: Bot): CompileResult {
    let program: CompileResult = rootNode.compile(bot);

    console.log("\n" + rootNode.prettyPrint(0));

    console.log(chalk.green("\nCompilation successful!"));

    if (program.possibleErrors.length > 0) {
        console.log(chalk.yellow("\nUncaught Error(s) could occure in:"));
        program.possibleErrors.forEach((error: Action) => {
            console.log("    " + chalk.red(error.stateName));
        });
        console.log(chalk.yellow("causing the bot to halt, and remain stuck in the same state.\n"));
    }

    return program;
}
