import chalk from "chalk";
import { Bot } from "mineflayer";
import { ConditionNode } from "../CondtionNode";

export class AndNode implements ConditionNode {
    andNodes: ConditionNode[];
    constructor(node: ConditionNode, ...nodes: ConditionNode[]) {
        this.andNodes = [node, ...nodes];
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);

        let str = indentation + chalk.gray("and [\n");
        this.andNodes.forEach((node) => {
            str += node.prettyPrint(indent + 1) + ",\n";
        });
        str += indentation + chalk.gray("]");

        return str;
    }

    getCondition(bot: Bot): () => boolean {
        return () => this.andNodes.every((andNode) => andNode.getCondition(bot)());
    }
}
