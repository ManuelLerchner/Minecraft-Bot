import { Action } from "./Action";
import { Bot } from "mineflayer";
import { EquipTask } from "../Types/EquipTask";
import { mcData } from "../projectSettings";

export class Equip extends Action {
    constructor(bot: Bot, name: string, private task: EquipTask) {
        super(bot, name);

        let entries = Object.entries(this.task);

        if (entries.length !== 1) {
            throw new Error("Equip task must have exactly one entry");
        }

        for (let [name, place] of entries) {
            let item = mcData.itemsByName[name];

            if (!item) {
                throw new Error("No item found with name " + name);
            }
        }
    }

    async onStateEntered() {
        let [item, place] = Object.entries(this.task)[0];

        let itemNr = mcData.itemsByName[item].id;

        try {
            await this.bot.equip(itemNr, place);
            this.setFinished();
        } catch (err: any) {
            this.setError(err);
        }
    }

    onStateExited(): void {
        this.reset();
    }

    canThrowError(): boolean {
        return true;
    }
}
