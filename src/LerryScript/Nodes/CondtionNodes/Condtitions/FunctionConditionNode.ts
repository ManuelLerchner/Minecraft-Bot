import { Bot } from "mineflayer";
import { ConditionNode } from "../CondtionNode";

export class FunctionCondtionNode implements ConditionNode {
    constructor(private name: string, private func: (bot: Bot) => boolean) {}

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);

        return indentation + this.name;
    }

    getCondition(bot: Bot): () => boolean {
        return () => this.func(bot);
    }
}
