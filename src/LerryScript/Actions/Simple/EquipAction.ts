import { Bot } from "mineflayer";
import { Action } from "../Action";

import { mcData } from "../../Settings";
import { EquipTask } from "../../Types/EquipTask";
import { EquipPosition } from "../../Types/EquipPosition";

export class EquipAction extends Action {
    itemName: string;
    place: EquipPosition;

    constructor(bot: Bot, equipTask: EquipTask) {
        super(bot);

        this.itemName = equipTask.itemName;
        this.place = equipTask.place;

        if (!this.itemName || !mcData.itemsByName[this.itemName]) {
            "No item found with name " + this.itemName + " in " + JSON.stringify(equipTask);
        }
    }

    async onStateEntered() {
        let itemNr = mcData.itemsByName[this.itemName].id;

        try {
            await this.bot.equip(itemNr, this.place);
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    canThrowError(): boolean {
        return true;
    }
}
