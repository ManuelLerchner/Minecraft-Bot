import { Bot } from "mineflayer";
import { Node } from "../Node";
import { AndNode } from "./Boolean/AndNode";
import { NotNode } from "./Boolean/NotNode";
import { OrNode } from "./Boolean/OrNode";

export interface ConditionNode extends Node {
    getCondition(bot: Bot): () => boolean;
    getName(): string;
}
