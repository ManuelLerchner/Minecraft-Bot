import { Bot } from "mineflayer";

import { Vec3 } from "vec3";
import { IfNode } from "../Nodes/ASTNodes/StructureNodes/IfNode";
import { SequentialNode } from "../Nodes/ASTNodes/StructureNodes/SequentialNode";
import { WhileNode } from "../Nodes/ASTNodes/StructureNodes/WhileNode";
import { IgnoreErrorNode } from "../Nodes/ASTNodes/SyntacticSugar/IgnoreErrorNode";
import {
  GoToNode,
  EquipNode,
  MineBlocksNode,
  SleepNode,
  DepositToChestNode,
  TakeFromChestNode,
  PlaceBlockNode,
  WalkOverAreaNode,
} from "../Nodes/ASTNodes/Tasks/Tasks";
import { NotNode } from "../Nodes/CondtionNodes/Boolean/NotNode";
import { ConditionNode } from "../Nodes/CondtionNodes/CondtionNode";
import { FunctionCondtionNode } from "../Nodes/CondtionNodes/Condtitions/FunctionConditionNode";
import { InventoryConditionNode } from "../Nodes/CondtionNodes/Condtitions/InventoryConditionNode";
import { mcData } from "../Settings";
import { Block } from "prismarine-block";

let findTrees = (bot: Bot) => {
  return bot.findBlocks({
    maxDistance: 20,
    count: 50,
    matching: (block: Block) => {
      return block.type === mcData.blocksByName["oak_log"].id;
    },
  });
};

let hasAxeWithMoreThan10Durability: ConditionNode = new InventoryConditionNode(
  "atleast",
  1,
  "wooden_axe",
  {
    comparison: "more_than",
    durability: 10,
  }
);

export const farmWoodNode = new SequentialNode(
  new IfNode(
    new NotNode(hasAxeWithMoreThan10Durability),
    new SequentialNode(
      new GoToNode("goto axe chests", new Vec3(200, 64, 163)),

      new DepositToChestNode("deposit old axe", new Vec3(200, 65, 161), {
        itemName: "wooden_axe",
        amount: "all",
      }),

      new TakeFromChestNode("take fresh axe", new Vec3(200, 64, 161), {
        itemName: "wooden_axe",
        amount: 1,
      })
    )
  ),

  new SequentialNode(
    new GoToNode("go to center of tree farm", new Vec3(203, 64, 169)),
    new IfNode(
      new FunctionCondtionNode(
        "a tree is here",
        (bot) => findTrees(bot).length > 0
      ),
      new SequentialNode(
        new EquipNode("equip axe", {
          itemName: "wooden_axe",
          place: "hand",
        }),
        new MineBlocksNode("mine tree", findTrees, {
          itemName: "wooden_axe",
          place: "hand",
        }),
        new SleepNode("sleep", 10000),
        new WalkOverAreaNode(
          "collect items",
          new Vec3(199, 64, 172),
          new Vec3(206, 64, 165)
        ),
        new SequentialNode(
          new GoToNode("go to chests", new Vec3(203, 64, 163)),
          new DepositToChestNode("deposit sapplings", new Vec3(204, 64, 161), {
            itemName: "oak_sapling",
            amount: "all",
          }),
          new DepositToChestNode("deposit log", new Vec3(204, 65, 161), {
            itemName: "oak_log",
            amount: "all",
          }),
          new DepositToChestNode("deposit apple", new Vec3(204, 66, 161), {
            itemName: "apple",
            amount: "all",
          }),
          new DepositToChestNode("deposit stick", new Vec3(204, 67, 161), {
            itemName: "stick",
            amount: "all",
          }),
          new IfNode(
            new InventoryConditionNode("less_than", 4, "oak_sapling"),
            new TakeFromChestNode("take sapplings", new Vec3(204, 64, 161), {
              itemName: "oak_sapling",
              amount: 4,
            })
          ),
          new IgnoreErrorNode(
            new PlaceBlockNode(
              "replant sappling 1",
              "above",
              new Vec3(204, 63, 167),
              "oak_sapling"
            ),
            new PlaceBlockNode(
              "replant sappling 2",
              "above",
              new Vec3(204, 63, 170),
              "oak_sapling"
            ),
            new PlaceBlockNode(
              "replant sappling 3",
              "above",
              new Vec3(201, 63, 170),
              "oak_sapling"
            ),
            new PlaceBlockNode(
              "replant sappling 4 ",
              "above",
              new Vec3(201, 63, 167),
              "oak_sapling"
            )
          )
        )
      )
    )
  )
);
