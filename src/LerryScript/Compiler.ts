import chalk from "chalk";
import { Bot } from "mineflayer";
import { ASTNode } from "./Nodes/ASTNodes/ASTNode";

import { Action } from "./Actions/Action";
import { CompileResult } from "./Types/CompileResult";

export function compile(rootNode: ASTNode, bot: Bot): CompileResult {
    let program: CompileResult = rootNode.compile(bot);

    console.log("\n" + rootNode.prettyPrint(0));

    console.log(chalk.green("\nCompilation successful!"));

    if (program.possibleErrors.length > 0) {
        console.log(chalk.yellow("\nUncaught Error(s) could occure in:"));
        program.possibleErrors.forEach((error: Action) => {
            console.log("    " + chalk.red(error.stateName));
        });
        console.log(
            chalk.yellow(
                "This could cause the bot to remain stuck in the failed state.\nYou can surround the failed state with a 'try' statement to catch such errors.\n"
            )
        );
    }

    return program;
}
