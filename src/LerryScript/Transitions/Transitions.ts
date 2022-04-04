import { StateTransition } from "mineflayer-statemachine";
import { Action } from "../Actions/Action";

export function createTransition(
    from: Action,
    to: Action,
    func: () => boolean,
    name: string
): StateTransition {
    return new StateTransition({
        parent: from,
        child: to,
        shouldTransition: func,
        name,
    });
}
