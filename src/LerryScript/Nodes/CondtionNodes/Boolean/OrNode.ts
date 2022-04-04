import chalk from "chalk";
import { Bot } from "mineflayer";
import { ConditionNode } from "../CondtionNode";

export class OrNode implements ConditionNode {
    orNodes: ConditionNode[];
    constructor(node: ConditionNode, ...nodes: ConditionNode[]) {
        this.orNodes = [node, ...nodes];
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);

        let str = indentation + chalk.gray("or [\n");
        this.orNodes.forEach((node) => {
            str += node.prettyPrint(indent + 1) + ",\n";
        });
        str += indentation + chalk.gray("]");

        return str;
    }

    getCondition(bot: Bot): () => boolean {
        return () => this.orNodes.some((andNode) => andNode.getCondition(bot)());
    }

    getName(): string {
        return this.orNodes.map((node) => node.getName()).join(" or ");
    }
}
