# Mineflayer-Compiler

## Introduction

In this project i built a compiler for the mineflayer-statemachine api, to improve the developer experience when trying to create a mineflayer-bot.

You can find a full description of this project on my [website](https://minecraft-bot.manuellerchner.de/).

## Concept

To prevent the programmer from hard-coding the underlying state machine by hand, you can use different nodes, to build a complete abstract-syntax-tree, which then gets compiled down to the state-machine level.

For example, you could enter something like:

```ts
let rootNode: ASTNode = new WhileNode(
  new FunctionConditionNode("infinite repeat", () => true),
  new SequentialNode(
    new GoToNode("goto chests", new Vec3(217, 64, 173)),

    new DepositToChestNode("deposit", new Vec3(219, 64, 171), {
      itemName: "cobblestone",
      amount: "all",
    }),

    new TryNode(
      new TakeFromChestNode("take iron-pickaxe", new Vec3(219, 64, 173), {
        itemName: "iron_pickaxe",
        amount: 1,
      }),

      new EquipNode("equip iron-pickaxe", {
        itemName: "iron_pickaxe",
        place: "hand",
      })
    )
  )
);
```

By creating a bot, and calling the `simulate()` function you can start the minecraft-bot with the given program:

```ts
const bot: Bot = createBot({
  host: "localhost",
  username: "LerryBot",
});

simulate(rootNode, bot);
```

This creates a minecraft-bot which joins the specified server, once spawned the bot immediately begins with its tasks.\
The compiled program gets printed to the console and additionally the statemachine-webserver starts. On this website you can see the current state of the bot.

## Example-Program

![mine-cobblestone-full-code](https://user-images.githubusercontent.com/54124311/163497433-00c5cd61-c06e-4310-b450-0ec0eebd155f.png)

## Resulting-StateMachine

![Cobble-Miner-big](https://user-images.githubusercontent.com/54124311/163497453-c7b941cd-c6ab-4012-8fe6-c0f177817ff7.png)

## Features

This is a subset of the actual UML-Diagram to get an overview of the code-structure.

![UMLClassDiagram-1](https://user-images.githubusercontent.com/54124311/163497567-eae8ebe3-9db5-45d3-a9fb-eefca60a85ad.png)

There are two different types of nodes:

1. `ASTNodes`
2. `ConditionNodes`

The ASTNode create the structure of the program, and allow the programmer to define actions which the bot should perform.\
The ConditionNodes are used to decide the behavior of `IfNodes` and `WhileNodes`.

There exist the following implementations:

- `ASTNodes`

  - `TaskNode`
  - `SequentialNode`
  - `IfNode`
  - `WhileNode`
  - `TryNode`
  - `IgnoreErrorNode`

- `ConditionNodes`
  - `FunctionConditionNode`
  - `InventoryConditionNode`
  - `AndNode`
  - `OrNode`
  - `NotNode`

---

## TaskNode

The `TaskNode` is an abstract class representing the actual task of the bot. \
The actual logic gets implemented by its direct children-classes.

- `GoToNode`
- `SleepNode`
- `MineBlockNode`
- `MineBlocksNode`
- `DepositToChestNode`
- `EquipNode`
- `CallNode`
- `ChatNode`
- `IdleNode`
- `ActivateHotbarIconNode`
- `ClickInventoryNode`
- `TakeFromChestNode`
- `WalkOverAreaNode`
- `PlaceBlockNode`

## GoToNode

Tells the bot to go to the specified coordinates.

```ts
constructor(description: string, private position: Vec3) {
  super("goto", description, position);
}
```

## SleepNode

Tells the bot to sleep for the specified time.

```ts
constructor(description: string, private blockPos: Vec3) {
  super("mineBlock", description, blockPos);
}
```

## MineBlockNode

Tells the bot to mine a specific block.

```ts
constructor(description: string, private millis: number) {
  super("sleep", description, millis);
}
```

## MineBlocksNode

Tells the bot to mine multiple blocks, based on a function call which returns all the blocks which should be mined.

```ts
constructor(
  description: string,
  private positionFunction: (bot: Bot) => Vec3[],
  private equipTask: EquipTask
) {
  super("mineBlocks", description, positionFunction);
}
```

## DepositToChestNode

Tells the bot to deposit a specific item into a provided chest.

```ts
constructor(description: string, private chestPos: Vec3, private task: DepositTask) {
      super("depositToChest", description, chestPos, task);
}
```

## EquipNode

Tells the bot to equip a specific item to a specific slot on the bot.

```ts
constructor(description: string, private equipTask: EquipTask) {
  super("equip", description, equipTask);
}
```

## CallNode

Tells the bot to call a specific function.

```ts
constructor(description: string, private func: () => void) {
    super("call", description, func);
}
```

## ChatNode

Tells the bot to write a specific message in the chat.

```ts
constructor(description: string, private chatMessage: string){
  super("chat", description, chatMessage);
}
```

## IdleNode

Tells the bot to go into an idle state.

```ts
constructor(description: string) {
    super("idle", description);
}
```

## ActivateHotbarIconNode

Tells the bot to activate an item in the hotbar.

```ts
constructor(description: string, private slot: number) {
    super("activateHotbarIcon", description, slot);
}
```

## ClickInventoryNode

Tells the bot to click on an item in the inventory.

```ts
constructor(description: string, private button: MouseButton, private slot: number) {
      super("clickInventory", description, slot);
  }
```

## TakeFromChestNode

Tells the bot to take a specific item from the chest.

```ts
constructor(description: string, private chestPos: Vec3, private takeTask: DepositTask) {
  super("takeFromChest", description, chestPos, takeTask);
}
```

## WalkOverAreaNode

Tells the bot to walk over a specified area, useful for collecting items.

```ts
constructor(description: string, private corner1: Vec3, private corner2: Vec3) {
  super("walkOverArea", description, corner1, corner2);
}
```

## PlaceBlockNode

Tells the bot to place a block on the specified block, uses the given direction to figure out the angle the bot should be placed from.

```ts
constructor(
  description: string,
  private placeDirection: Direction,
  private referencePos: Vec3,
  private itemName: string
) {
  super("placeBlock", description, placeDirection, referencePos, itemName);
}
```

---

---

## SequentialNode

The sequential Node allows the execution of multiple other Nodes in a sequential order.\
Its constructor receives an arbitrary amount of Nodes which then get executed in order.

### SequentialNode - Constructor

```ts
constructor(child: ASTNode, ...children: ASTNode[]) {
  this.children = [child, ...children];
}
```

### SequentialNode - Example Usage

```ts
let rootNode: ASTNode = new SequentialNode(
  new GoToNode("goto chests", new Vec3(217, 64, 173)),

  new DepositToChestNode("deposit", new Vec3(219, 64, 171), {
    itemName: "cobblestone",
    amount: "all",
  }),

  new TakeFromChestNode("take iron-pickaxe", new Vec3(219, 64, 173), {
    itemName: "iron_pickaxe",
    amount: 1,
  })
);
```

## IfNode

The `IfNode` provides a way for the bot to dynamically choose between two possible branches. It evaluates the given condition and the leads the bot to the according path.

### IfNode - Constructor

```ts
constructor(
  private condition: ConditionNode,
  private ifTrue: ASTNode,
  private ifFalse?: ASTNode
) {}
```

The constructor takes a ConditionNode and two nodes which should be executed whether the condition is true or false. \
The `isFalse` node is optional.

### IfNode - Example Usage

```ts
let rootNode: ASTNode = new IfNode(
  new InventoryConditionNode("atleast", 1, "wooden_pickaxe", {
    comparison: "more_than",
    durability: 10,
  }),

  new GoToNode("if true, goto cobble-generator", new Vec3(217, 64, 173)),

  new GoToNode("if false, goto chests ", new Vec3(207, 64, 173))
);
```

## WhileNode

The `WhileNode` provides a way for the bot to repeat a given Node, as long as the provided condition is `true`. It evaluates the given condition and the leads the bot into the loop or exits the `WhileNode` if the condition evaluates to `false`.

### WhileNode - Constructor

```ts
constructor(
  private condition: ConditionNode,
  private body: ASTNode
) {}
```

The constructor takes a ConditionNode and a body node which gets executed until the condition is no longer true.

### WhileNode - Example Usage

```ts
let rootNode: ASTNode = new WhileNode(
  new FunctionConditionNode("infinite repeat", () => true),
  new SequentialNode(
    new GoToNode("goto chests", new Vec3(217, 64, 173)),
    new DepositToChestNode("deposit", new Vec3(219, 64, 171), {
      itemName: "cobblestone",
      amount: "all",
    }),
    new GoToNode("goto away", new Vec3(267, 64, 173))
  )
);
```

## TryNode

The `TryNode` provides a way for the bot to dynamically switch to the error-node, if some node inside the main_task-node throws an error.

### TryNode - Constructor

```ts
constructor(
  private main_task: ASTNode,
  private error: ASTNode
) {}
```

The constructor takes a main-node and an error-node. The bot starts to execute the main-node, and switches to the error-node if something goes wrong while executing the main-node.

### TryNode - Example Usage

```ts
let rootNode: ASTNode = new TryNode(
  new SequentialNode(
    new GoToNode("go up in the air", new Vec3(267, 164, 173)),
    new DepositToChestNode("deposit to a chest", new Vec3(219, 164, 171), {
      itemName: "cobblestone",
      amount: "all",
    })
  ),
  new ChatNode("error", "Hey, an error occurred...")
);
```

## IgnoreErrorNode

The `IgnoreErrorNode` works similar to the `SequentialNode`. The main difference is that the `IgnoreErrorNode` continues to the next
children-node, even if the previous one threw an error. \
This node is just syntactic-sugar.

### IgnoreErrorNode - Example Usage

```ts
let rootNode: ASTNode = new IgnoreErrorNode(
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
  )
);
```

---

---

## FunctionCondtionNode

The FunctionCondtionNode is used to define a condition based on the result of a function call.

```ts
constructor(
  private name: string,
  private func: (bot: Bot) => boolean
) {}
```

The constructor takes a description name for the node and a boolean function. This function gets evaluated when the bot needs to take a decision.

### FunctionCondtionNode - Example Usage

The main use of the function is to create infinite loops, but there exist also some other, more complex things you can do with it.

```ts
new FunctionCondtionNode("infinite repeat", () => true);
```

## InventoryConditionNode

The InventoryConditionNode is used to define a condition based on the current inventory of the bot.

```ts
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
```

The constructor takes a comparison-attribute of the following types: `"exactly" | "less_than" | "more_than" | "atleast" | "atmost";`, an amount of items to compare against, and the minecraft-itemname of the item.\
There is also an optional argument to select only items with the given durability conditions:

```ts
type DurabilityData = {
  comparison: "exactly" | "less_than" | "more_than" | "atleast" | "atmost";
  durability: number;
};
```

### InventoryConditionNode - Example Usage

```ts
new InventoryConditionNode("atleast", 1, "wooden_axe", {
  comparison: "more_than",
  durability: 10,
});
```

## AndNode

The AndNode is used to determine the logical-and of multiple `ConditionNodes`.

```ts
constructor(node: ConditionNode, ...nodes: ConditionNode[]) {
  this.andNodes = [node, ...nodes];
}
```

The constructor takes an arbitrary amount of arguments. Once the bot evaluates this condition the truth-value is calculated based on the logical-and of all the supplied `ConditionNodes`.

### AndNode - Example Usage

```ts
new AndNode(
  new InventoryConditionNode("atmost", 10, "cobblestone"),
  new InventoryConditionNode("atleast", 1, "wooden_pickaxe", {
    comparison: "more_than",
    durability: 10,
  })
);
```

## OrNode

The OrNode is used to determine the logical-or of multiple `ConditionNodes`.

```ts
constructor(node: ConditionNode, ...nodes: ConditionNode[]) {
  this.orNodes = [node, ...nodes];
}
```

The constructor takes an arbitrary amount of arguments. Once the bot evaluates this condition the truth-value is calculated based on the logical-or of all the supplied `ConditionNodes`.

### OrNode - Example Usage

```ts
new OrNode(
  new InventoryConditionNode("atmost", 10, "cobblestone"),
  new InventoryConditionNode("atleast", 1, "wooden_pickaxe", {
    comparison: "more_than",
    durability: 10,
  })
);
```

## NotNode

The NotNode is used to determine the logical-not of a `ConditionNodes`.

```ts
constructor(private node: ConditionNode) {}
```

The constructor takes a single ConditionNode. Once the bot evaluates this condition the truth-value is calculated based on the logical-not of the supplied `ConditionNode`.

### NotNode - Example Usage

```ts
new NotNode(
  new InventoryConditionNode("atleast", 1, "wooden_pickaxe", {
    comparison: "more_than",
    durability: 10,
  })
);
```
