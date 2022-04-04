import { Bot } from "mineflayer";
import { Vec3 } from "vec3";

import {
    globalSettings,
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    BehaviorIdle,
    BehaviorPrintServerStats,
    NestedStateMachine,
} from "mineflayer-statemachine";

import { MineBlocks } from "./states/MineStates";
import { GetPickaxe } from "./states/GetPickaxe";

import {
    Failure,
    GotoXZ,
    CompassPort,
    EmptyInventory,
    GoToHome,
} from "../_classes/states";

globalSettings.debugMode = true;

const mineFlayer = require("mineflayer");

const bot: Bot = mineFlayer.createBot({
    host: "localhost",
    username: "LerryBot",
});

bot.on("error", console.log);

bot.loadPlugin(require("mineflayer-pathfinder").pathfinder);

bot.once("spawn", async () => {
    //region States
    const printServerStates: BehaviorPrintServerStats =
        new BehaviorPrintServerStats(bot);

    const compassPort: CompassPort = new CompassPort(bot, "compassPort", 12);

    const goToHome: GoToHome = new GoToHome(bot, "goToHome", "home");

    const idleState: BehaviorIdle = new BehaviorIdle();

    const gotoCobble1: GotoXZ = new GotoXZ(
        bot,
        new Vec3(216, 64, 179),
        "goto cobble 1"
    );

    const mineCobble1: MineBlocks = new MineBlocks(
        bot,
        new Vec3(215, 65, 179),
        new Vec3(216, 65, 180),
        "mine cobble 1",
        5,
        10 + 5
    );

    const gotoCobble2: GotoXZ = new GotoXZ(
        bot,
        new Vec3(214, 64, 181),
        "goto cobble 2"
    );

    const mineCobble2: MineBlocks = new MineBlocks(
        bot,
        new Vec3(215, 65, 181),
        new Vec3(214, 65, 180),
        "mine cobble 2",
        5,
        10 + 5
    );

    const goToEmptyItems: GotoXZ = new GotoXZ(
        bot,
        new Vec3(219, 64, 175),
        "goToEmptyItems"
    );

    const emptyItems = new EmptyInventory(
        bot,
        new Vec3(219, 64, 175),
        "emptyItems"
    );

    const goToGetPickaxe: GotoXZ = new GotoXZ(
        bot,
        new Vec3(219, 64, 172),
        "goToGetPickaxe"
    );

    const getPickaxe: GetPickaxe = new GetPickaxe(
        bot,
        new Vec3(219, 64, 172),
        "getPickaxe"
    );

    const F_ItemChestFull = new Failure(
        bot,
        "F_ItemChestFull",
        "Ich kann nichts mehr in die Kiste legen."
    );

    const F_PickaxeChestEmpty = new Failure(
        bot,
        "F_PickaxeChestEmpty",
        "Ich habe keine Spitzhacken mehr."
    );

    //endregion

    const transitions = [
        //serverstats -> compassport
        new StateTransition({
            parent: printServerStates,
            child: compassPort,
            shouldTransition: () => true,
        }),
        //compassport -> goToHome
        new StateTransition({
            parent: compassPort,
            child: goToHome,
            shouldTransition: () => compassPort.Done(),
        }),
        //goToHome -> idle
        new StateTransition({
            parent: goToHome,
            child: idleState,
            shouldTransition: () => goToHome.Done(),
            onTransition: () => bot.acceptResourcePack(),
        }),

        //idle -> gotoCobble1
        new StateTransition({
            parent: idleState,
            child: gotoCobble1,
            name: "Goto cobble1",
            shouldTransition: () => true,
        }),

        //gotoCobble1 -> mineCobble1
        new StateTransition({
            parent: gotoCobble1,
            child: mineCobble1,
            name: "Mining Cobble1",
            shouldTransition: () => gotoCobble1.hasReached(),
        }),

        //mineCobble1 -> gotoCobble2
        new StateTransition({
            parent: mineCobble1,
            child: gotoCobble2,
            name: "goto cobble2",
            shouldTransition: () => mineCobble1.Done(),
        }),

        //gotoCobble2 -> mineCobble2
        new StateTransition({
            parent: mineCobble2,
            child: goToEmptyItems,
            name: "goToEmptyItems",
            shouldTransition: () => mineCobble2.NoPickaxe(),
        }),

        //gotoCobble2 -> mineCobble2
        new StateTransition({
            parent: mineCobble2,
            child: gotoCobble1,
            name: "goto cobble1",
            shouldTransition: () => mineCobble2.Done(),
        }),

        //mineCobble2 -> gotoCobble2
        new StateTransition({
            parent: gotoCobble2,
            child: mineCobble2,
            name: "goto cobble2",
            shouldTransition: () => gotoCobble2.hasReached(),
        }),

        //mineCobble2 -> gotoEmptyItems
        new StateTransition({
            parent: mineCobble1,
            child: goToEmptyItems,
            name: "goToEmptyItems",
            shouldTransition: () => mineCobble1.NoPickaxe(),
        }),

        //goToEmptyItems -> emptyItems
        new StateTransition({
            parent: goToEmptyItems,
            child: emptyItems,
            name: "emptyInventory",
            shouldTransition: () => goToEmptyItems.hasReached(),
        }),

        //emptyItems -> gotoGetPickaxe
        new StateTransition({
            parent: emptyItems,
            child: goToGetPickaxe,
            name: "goToGetPickaxe",
            shouldTransition: () =>
                emptyItems.IsDone() && !emptyItems.IsChestFull(),
        }),

        //goToGetPickaxe -> getPickaxe
        new StateTransition({
            parent: goToGetPickaxe,
            child: getPickaxe,
            name: "getPickaxe from chest",
            shouldTransition: () => goToGetPickaxe.hasReached(),
        }),

        //emptyItems -> F_ItemChestFull
        new StateTransition({
            parent: emptyItems,
            child: F_ItemChestFull,
            name: "F_ItemChestFull",
            shouldTransition: () => emptyItems.IsChestFull(),
        }),

        //getPickaxe -> F_PickaxeChestEmpty
        new StateTransition({
            parent: getPickaxe,
            child: F_PickaxeChestEmpty,
            name: "F_PickaxeChestEmpty",
            shouldTransition: () =>
                getPickaxe.Done() && getPickaxe.ChestEmpty(),
        }),

        new StateTransition({
            parent: getPickaxe,
            child: idleState,
            name: "Back to idle",
            shouldTransition: () => getPickaxe.Done(),
        }),
    ];
    const root = new NestedStateMachine(transitions, printServerStates);
    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine);

    webserver.startServer();
});
