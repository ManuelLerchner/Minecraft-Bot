import {Bot, Chest, Player} from 'mineflayer'
import {EventEmitter} from 'events'
import {Entity} from 'prismarine-entity'
import {Vec3} from 'vec3'
import {Item} from 'prismarine-item'
import {Block} from 'prismarine-block'
import {Window} from 'prismarine-windows'
import {Recipe} from 'prismarine-recipe'
import {ChatMessage} from 'prismarine-chat'
import {
    globalSettings,
    StateTransition,
    BotStateMachine,
    StateMachineWebserver,
    EntityFilters,
    BehaviorIdle,
    BehaviorPrintServerStats,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine, StateBehavior
} from "mineflayer-statemachine";

//region MineFlayer Creation
globalSettings.debugMode = true;

import {SucheHolz, LeereInvErweitert, EmptyInventory, Vorbereiten, HoleItemAusKiste, GoToRandom,} from "./holz_states";
import {
    Failure,
    CompassPort,
    GoToIsland,
    GotoXYZ,
    SearchDirt,
    DecideAction,
    CutTree,
    PlantSapling, GotoSharedData
} from "../_classes/states";
import {DiscordHelper} from "../_classes/discordhelper";
import {stateShare} from "../_classes/stateShare";

const mineFlayer = require('mineflayer')

const bot: Bot = mineFlayer.createBot(
    {
        username: 'Holzer',
        host: ""
    });
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
//endregion
//Discord-Bot hinzufügen
const helper: DiscordHelper = new DiscordHelper(bot, "", "");

bot.once("spawn", async () => {
    //region States
    //region Serverconnect
    const printServerStates: BehaviorPrintServerStats = new BehaviorPrintServerStats(bot);
    //const compassPort: CompassPort = new CompassPort(bot, "compassPort", 2);
    //const goToIsland: GoToIsland = new GoToIsland(bot, "goToIsland", 29);

    //endregion
    const mindurability: number = 50;
    const minSaplings: number = 32;
    const state_idle: BehaviorIdle = new BehaviorIdle();
    const state_goToCenter = new GotoXYZ(bot, new Vec3(128, 99, -74), "goToCenter");
    const state_vorbereiten = new Vorbereiten(bot, "Vorbereiten", mindurability, minSaplings);
    const state_HoleAxt = new HoleItemAusKiste(bot, "Axt holen", ["iron_axe"], 1, new Vec3(130, 99, -74));
    const state_HoleSapling = new HoleItemAusKiste(bot, "Sapling holen", ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"], 64, new Vec3(130, 99, -73));


    //const state_sucheHolz = new SucheHolz(bot, "suche Holz", 6);
    // temporärer State für neue Implementierung
    const state_middleIdle: BehaviorIdle = new BehaviorIdle();

    let share: stateShare = new stateShare(null);
    const state_SearchDirt: SearchDirt = new SearchDirt(bot, "state_SearchDirt", 50, share);
    const state_GoToDirt: GotoSharedData = new GotoSharedData(bot, "state_GoToDirt", share);
    const state_DecideAction: DecideAction = new DecideAction(bot, "state_DecideAction", share);
    const state_CutTree: CutTree = new CutTree(bot, "state_CutTree", share);
    const state_PlantSapling: PlantSapling = new PlantSapling(bot, "state_PlantSapling", share);

    const state_emptyItems = new EmptyInventory(bot, new Vec3(130, 99, -75), "emptyItems", mindurability, minSaplings);
    const state_GoToRandom = new GoToRandom(bot, "state_GoToRandom");
    //endregion

    //region Error-States
    const errorstate_axe = new Failure(bot, "ErrorState_Axe", "Axt konnte nicht genommen werden");
    const errorstate_sapling = new Failure(bot, "Errorstate_Sapling", "Sapling konnte nicht genommen werden");
    //const errorstate_axeAndSapling=new Failure(bot,"Errorstate_AxeAndSapling","Axt und sapling konnten nicht genommen werden");
    const errorstate_emptyItemsFailed = new Failure(bot, "Errorstate_EmptyItemsFailed", "Items konnten nicht geleert werden");
    const errorstate_NoDecision = new Failure(bot, "errorstate_NoDecision", "Keine Entscheidung konnte getroffen werden");
    //endregion
    const transitions = [
        new StateTransition({
            parent: printServerStates,
            child: state_idle,
            name: 'Idle-State ',
            shouldTransition: () => true
        }),
        new StateTransition({
            parent: state_idle,
            child: state_goToCenter,
            name: 'GotoCenter ',
            shouldTransition: () => true
        }),
        new StateTransition({
            parent: state_goToCenter,
            child: state_vorbereiten,
            name: 'vorbereiten',
            shouldTransition: () => (state_goToCenter.hasReached())
        }),
        new StateTransition({
            parent: state_emptyItems,
            child: state_GoToRandom,
            name: 'Gehe zu Random',
            shouldTransition: () => (state_emptyItems.IsDone() && !state_emptyItems.IsChestFull())
        }),
        new StateTransition({
            parent: state_GoToRandom,
            child: state_GoToRandom,
            name: 'Bleibe bei GeheZuRandom',
            shouldTransition: () => (state_GoToRandom.IsDone() && !state_GoToRandom.DoExit())
        }),
        new StateTransition({
            parent: state_GoToRandom,
            child: state_middleIdle,
            name: 'Idle',
            shouldTransition: () => (state_GoToRandom.IsDone() && state_GoToRandom.DoExit())
        }),
        new StateTransition({
            parent: state_emptyItems,
            child: errorstate_emptyItemsFailed,
            name: 'Fehlerzustand entleeren',
            shouldTransition: () => (state_emptyItems.IsDone() && state_emptyItems.IsChestFull())
        }),
        new StateTransition({
            parent: state_vorbereiten,
            child: state_GoToRandom,
            name: 'gehe Random',
            shouldTransition: () => state_vorbereiten.Done() && !state_vorbereiten.NoAxe() && !state_vorbereiten.NoSapling()
        }),
        new StateTransition({
            parent: state_vorbereiten,
            child: state_HoleAxt,
            name: 'Hole Axt',
            shouldTransition: () => state_vorbereiten.Done() && state_vorbereiten.NoAxe() && !state_vorbereiten.NoSapling()
        }),
        new StateTransition({
            parent: state_vorbereiten,
            child: state_HoleSapling,
            name: 'Hole Sapling',
            shouldTransition: () => state_vorbereiten.Done() && !state_vorbereiten.NoAxe() && state_vorbereiten.NoSapling()
        }),
        new StateTransition({
            parent: state_HoleSapling,
            child: state_vorbereiten,
            name: 'erneut Vorbereiten',
            shouldTransition: () => state_HoleSapling.Done() && state_HoleSapling.Sucess()
        }),
        new StateTransition({
            parent: state_HoleAxt,
            child: state_vorbereiten,
            name: 'erneut Vorbereiten',
            shouldTransition: () => state_HoleAxt.Done() && state_HoleAxt.Sucess()
        }),
        new StateTransition({
            parent: state_HoleAxt,
            child: errorstate_axe,
            name: 'Axt konnte nicht geholt werden',
            shouldTransition: () => state_HoleAxt.Done() && !state_HoleAxt.Sucess()
        }),
        new StateTransition({
            parent: state_HoleSapling,
            child: errorstate_sapling,
            name: 'Sapling konnte nicht geholt werden',
            shouldTransition: () => state_HoleSapling.Done() && !state_HoleSapling.Sucess()
        }),
        new StateTransition({
            parent: state_middleIdle,
            child: state_SearchDirt,
            name: '',
            shouldTransition: () => true
        }),
        new StateTransition({
            parent: state_SearchDirt,
            child: state_GoToDirt,
            name: '',
            shouldTransition: () => state_SearchDirt.Done() && state_SearchDirt.Found()
        }),
        new StateTransition({
            parent: state_SearchDirt,
            child: state_goToCenter,
            name: '',
            shouldTransition: () => state_SearchDirt.Done() && !state_SearchDirt.Found()
        }),
        new StateTransition({
            parent: state_GoToDirt,
            child: state_DecideAction,
            name: '',
            shouldTransition: () => state_GoToDirt.hasReached()
        }),
        new StateTransition({
            parent: state_DecideAction,
            child: state_CutTree,
            name: '',
            shouldTransition: () => state_DecideAction.Done() && state_DecideAction.Abbauen()
        }),
        new StateTransition({
            parent: state_DecideAction,
            child: state_PlantSapling,
            name: '',
            shouldTransition: () => state_DecideAction.Done() && state_DecideAction.Setzen()
        }),
        new StateTransition({
            parent: state_PlantSapling,
            child: state_goToCenter,
            name: '',
            shouldTransition: () => state_PlantSapling.Done()
        }),
        new StateTransition({
            parent: state_CutTree,
            child: state_goToCenter,
            name: '',
            shouldTransition: () => state_CutTree.Done()
        }),
        new StateTransition({
            parent: state_DecideAction,
            child: errorstate_NoDecision,
            name: '',
            shouldTransition: () => state_DecideAction.Done() && !state_DecideAction.Abbauen() && !state_DecideAction.Setzen()
        }),
    ];

    const root = new NestedStateMachine(transitions, printServerStates);
    const stateMachine = new BotStateMachine(bot, root);
    const webserver = new StateMachineWebserver(bot, stateMachine)
    webserver.startServer();
});
