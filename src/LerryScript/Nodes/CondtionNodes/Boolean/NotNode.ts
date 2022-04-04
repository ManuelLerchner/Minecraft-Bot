import chalk from "chalk";
import { Bot } from "mineflayer";
import { ConditionNode } from "../CondtionNode";

export class NotNode implements ConditionNode {
    constructor(private node: ConditionNode) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);

        let str = indentation + chalk.gray("not [\n");
        str += this.node.prettyPrint(indent + 1) + "\n";
        str += indentation + chalk.gray("]");

        return str;
    }

    getCondition(bot: Bot): () => boolean {
        return () => !this.node.getCondition(bot)();
    }
}
