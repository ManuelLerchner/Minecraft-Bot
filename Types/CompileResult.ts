import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../Actions/Action";

export type CompileResult = {
    actions: Action[];
    transitions: StateTransition[];
    possibleErrors: Action[];
    enter: Action;
    exit: Action;
};
