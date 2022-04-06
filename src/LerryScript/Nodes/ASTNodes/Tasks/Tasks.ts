import { Bot } from "mineflayer";
import { Action } from "../../../Actions/Action";
import { Vec3 } from "vec3";
import { TaskNode } from "../StructureNodes/TaskNode";
import { DepositTask } from "../../../Types/DepositTask";
import { EquipTask } from "../../../Types/EquipTask";
import { DepositToChestAction } from "../../../Actions/Simple/DepositToChestAction";
import { EquipAction } from "../../../Actions/Simple/EquipAction";
import { GoToAction } from "../../../Actions/Simple/GoToAction";
import { IdleAction } from "../../../Actions/Simple/IdleAction";

import { SleepAction } from "../../../Actions/Simple/SleepAction";
import { TakeFromChestAction } from "../../../Actions/Simple/TakeFromChestAction";
import { CallAction } from "../../../Actions/Simple/CallAction";
import { ChatAction } from "../../../Actions/Simple/ChatAction";
import { ActivateHotbarIconAction } from "../../../Actions/Simple/ActivateHotbarIconAction";
import { ClickInventoryAction } from "../../../Actions/Simple/ClickInventoryAction";
import { MouseButton } from "../../../Types/MouseButton";
import { MineBlocksAction } from "../../../Actions/Composed/MineBlocksAction";
import { MineBlockAction } from "../../../Actions/Simple/MineBlockAction";
import { WalkOverAreaAction } from "../../../Actions/Composed/WalkOverAreaAction";

import { Direction } from "../../../Types/Direction";
import { PlaceBlockAction } from "../../../Actions/Composed/PlaceBlockAction";

export class GoToNode extends TaskNode {
    constructor(description: string, private position: Vec3) {
        super("goto", description, position);
    }

    getAction(bot: Bot): Action {
        return new GoToAction(bot, this.position);
    }
}

export class SleepNode extends TaskNode {
    constructor(description: string, private millis: number) {
        super("sleep", description, millis);
    }

    getAction(bot: Bot): Action {
        return new SleepAction(bot, this.millis);
    }
}

export class MineBlockNode extends TaskNode {
    constructor(description: string, private blockPos: Vec3) {
        super("mineBlock", description, blockPos);
    }

    getAction(bot: Bot): Action {
        return new MineBlockAction(bot, this.blockPos);
    }
}

export class MineBlocksNode extends TaskNode {
    constructor(description: string, private positionFunction: (bot: Bot) => Vec3[]) {
        super("mineBlocks", description, positionFunction);
    }

    getAction(bot: Bot): Action {
        return new MineBlocksAction(bot, this.positionFunction);
    }
}

export class DepositToChestNode extends TaskNode {
    constructor(description: string, private chestPos: Vec3, private task: DepositTask) {
        super("depositToChest", description, chestPos, task);
    }

    getAction(bot: Bot): Action {
        return new DepositToChestAction(bot, this.chestPos, this.task);
    }
}

export class EquipNode extends TaskNode {
    constructor(description: string, private equipTask: EquipTask) {
        super("equip", description, equipTask);
    }

    getAction(bot: Bot): Action {
        return new EquipAction(bot, this.equipTask);
    }
}

export class CallNode extends TaskNode {
    constructor(description: string, private func: () => void) {
        super("call", description, func);
    }

    getAction(bot: Bot): Action {
        return new CallAction(bot, this.func);
    }
}

export class ChatNode extends TaskNode {
    constructor(description: string, private chatMessage: string) {
        super("chat", description, chatMessage);
    }

    getAction(bot: Bot): Action {
        return new ChatAction(bot, this.chatMessage);
    }
}

export class IdleNode extends TaskNode {
    constructor(description: string) {
        super("idle", description);
    }

    getAction(bot: Bot): Action {
        return new IdleAction(bot);
    }
}

export class ActivateHotbarIconNode extends TaskNode {
    constructor(description: string, private slot: number) {
        super("activateHotbarIcon", description, slot);
    }

    getAction(bot: Bot): Action {
        return new ActivateHotbarIconAction(bot, this.slot);
    }
}

export class ClickInventoryNode extends TaskNode {
    constructor(description: string, private button: MouseButton, private slot: number) {
        super("clickInventory", description, slot);
    }

    getAction(bot: Bot): Action {
        return new ClickInventoryAction(bot, this.button, this.slot);
    }
}

export class TakeFromChestNode extends TaskNode {
    constructor(description: string, private chestPos: Vec3, private takeTask: DepositTask) {
        super("takeFromChest", description, chestPos, takeTask);
    }

    getAction(bot: Bot): Action {
        return new TakeFromChestAction(bot, this.chestPos, this.takeTask);
    }
}

export class WalkOverAreaNode extends TaskNode {
    constructor(description: string, private corner1: Vec3, private corner2: Vec3) {
        super("walkOverArea", description, corner1, corner2);
    }

    getAction(bot: Bot): Action {
        return new WalkOverAreaAction(bot, this.corner1, this.corner2);
    }
}

export class PlaceBlockNode extends TaskNode {
    constructor(
        description: string,
        private placeDirection: Direction,
        private referencePos: Vec3,
        private itemName: string
    ) {
        super("placeBlock", description, placeDirection, referencePos, itemName);
    }

    getAction(bot: Bot): Action {
        return new PlaceBlockAction(bot, this.placeDirection, this.referencePos, this.itemName);
    }
}
