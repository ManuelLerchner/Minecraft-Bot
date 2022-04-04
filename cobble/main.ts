import * as mineflayer from "mineflayer";
import { compile, startBot } from "../Runner/Runner";
import { Vec3 } from "vec3";

import { SequentialNode } from "../Nodes/SequentialNode";
import { WhileNode } from "../Nodes/WhileNode";
import { TaskNode } from "../Nodes/TaskNode";
import { Node } from "./../Nodes/Node";
import { IfNode } from "../Nodes/IfNode";
import { TryNode } from "../Nodes/TryNode";
import { Bot } from "mineflayer";

const bot: Bot = mineflayer.createBot({
    host: "localhost",
    username: "LerryBot",
});

bot.loadPlugin(require("mineflayer-pathfinder").pathfinder);

const infiniteRepeat = () => true;

const has10Cobble = () => {
    let cobble = bot.inventory.items().find((item) => item.name === "cobblestone");

    return cobble && cobble.count >= 10;
};

function hasPickaxe() {
    let hasPickaxe = bot.inventory.items().find((item) => item.name === "diamond_pickaxe");

    return !!hasPickaxe;
}

let rootNode = new WhileNode(
    infiniteRepeat,
    new SequentialNode(
        new IfNode(
            hasPickaxe,
            new SequentialNode(
                new TaskNode("goto", "cobble farm 1", new Vec3(214, 64, 181)),

                new WhileNode(
                    () => !has10Cobble(),
                    new TaskNode("mine", "mineCobble", new Vec3(215, 65, 181))
                ),

                new TaskNode("goto", "empty inventory", new Vec3(219, 64, 175)),

                new TryNode(
                    new TaskNode("deposit", "deposit cobble", new Vec3(219, 64, 175), {
                        cobblestone: "all",
                    }),
                    new TaskNode("idle", "chest is full")
                ),

                new TaskNode("sleep", "Sleep", 2000)
            ),
            new SequentialNode(
                new TaskNode("goto", "pickaxe chest", new Vec3(217, 64, 173)),

                new TryNode(
                    new TaskNode("take", "take pickaxe", new Vec3(219, 64, 173), {
                        diamond_pickaxe: "1",
                    }),
                    new TaskNode("idle", "no pickaxe in chest")
                ),
                new TaskNode("equip", "put pickaxe in hand", {
                    item: "diamond_pickaxe",
                    destination: "hand",
                })
            )
        )
    )
);

startBot(rootNode, bot);
