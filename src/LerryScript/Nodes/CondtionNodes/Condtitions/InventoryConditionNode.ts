import { Bot } from "mineflayer";
import { mcData } from "../../../projectSettings";
import { Comparison } from "../../../Types/CompareAttributes";
import { DurabilityData } from "../../../Types/DurabilityData";
import { ConditionNode } from "../CondtionNode";

export class InventoryConditionNode implements ConditionNode {
    constructor(
        private attribute: Comparison,
        private amount: number,
        private itemName: string,
        private duribailityData?: DurabilityData
    ) {
        if (!mcData.itemsByName[this.itemName]) {
            throw new Error("No item found with name " + itemName);
        }
    }

    prettyPrint(indent: number): string {
        let indentation = " ".repeat(indent * 4);
        return (
            indentation +
            "Bot has " +
            this.attribute +
            " " +
            this.amount +
            " " +
            this.itemName +
            (this.duribailityData
                ? " with durability " +
                  this.duribailityData.comparison +
                  " " +
                  this.duribailityData.durability
                : "")
        );
    }

    inventoryContainsCondition(bot: Bot) {
        let invItem = bot.inventory.items().find((invItem) => invItem.name === this.itemName);
        let invItemCount = invItem ? invItem.count : 0;

        let durabiltyConditionMet = true;

        if (invItem && this.duribailityData) {
            let durabilityComparison = this.duribailityData.comparison;
            let durabilityValueShould = this.duribailityData.durability;
            let maxDurability = mcData.itemsByName[invItem.name].maxDurability;

            let remaining = maxDurability - invItem.durabilityUsed;

            switch (durabilityComparison) {
                case "exactly":
                    durabiltyConditionMet = remaining === durabilityValueShould;
                    break;
                case "more than":
                    durabiltyConditionMet = remaining > durabilityValueShould;
                    break;
                case "less than":
                    durabiltyConditionMet = remaining < durabilityValueShould;
            }

            if (!durabiltyConditionMet) {
                return false;
            }
        }

        switch (this.attribute) {
            case "exactly":
                return invItemCount === this.amount;
            case "more than":
                return invItemCount > this.amount;
            case "less than":
                return invItemCount < this.amount;
        }
    }

    getCondition(bot: Bot) {
        return () => this.inventoryContainsCondition(bot);
    }
}
