import { Bot } from "mineflayer";
import { Node } from "../Node";
import { AndNode } from "./Boolean/AndNode";
import { NotNode } from "./Boolean/NotNode";
import { OrNode } from "./Boolean/OrNode";

export abstract class ConditionNode implements Node {
    constructor() {}

    abstract prettyPrint(indent: number): string;

    abstract getCondition(bot: Bot): () => boolean;
    abstract getName(): string;
}
