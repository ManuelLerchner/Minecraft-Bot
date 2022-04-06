import { Vec3 } from "vec3";
import { Bot } from "mineflayer";
import { Direction } from "../../Types/Direction";
import { Action } from "../Action";
import { mcData } from "../../Settings";
import { goals } from "mineflayer-pathfinder";

export class PlaceBlockAction extends Action {
    constructor(
        bot: Bot,
        private placeDirection: Direction,
        private referencePos: Vec3,
        private itemName: string
    ) {
        super(bot);

        if (!mcData.itemsByName[this.itemName]) {
            "No item found with name " + this.itemName;
        }
    }

    async onStateEntered() {
        try {
            await this.bot.pathfinder.goto(
                new goals.GoalNear(this.referencePos.x, this.referencePos.y, this.referencePos.z, 4)
            );

            let itemNr = mcData.itemsByName[this.itemName].id;
            await this.bot.equip(itemNr, "hand");

            let referenceBlock = this.bot.blockAt(this.referencePos);

            if (!referenceBlock) {
                throw new Error("No Block found at " + this.referencePos);
            }

            let faceVector = this.getFaceVector();

            await this.bot.placeBlock(referenceBlock, faceVector);

            this.setFinished();
        } catch (e: any) {
            this.setError(e);
        }
    }

    getFaceVector() {
        switch (this.placeDirection) {
            case "above":
                return new Vec3(0, 1, 0);
            case "below":
                return new Vec3(0, -1, 0);
            case "north":
                return new Vec3(0, 0, -1);
            case "south":
                return new Vec3(0, 0, 1);
            case "east":
                return new Vec3(1, 0, 0);
            case "west":
                return new Vec3(-1, 0, 0);
        }
    }

    canThrowError(): boolean {
        return true;
    }
}
