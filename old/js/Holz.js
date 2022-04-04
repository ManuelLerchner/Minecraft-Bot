// Create your bot
const mineflayer = require("mineflayer");
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const bot = mineflayer.createBot(
  {
    host: 'localhost',
    username: "Holzyeeter"
  });
bot.loadPlugin(require('mineflayer-pathfinder').pathfinder);
const Vec3 = require('vec3').Vec3;

const {
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
  NestedStateMachine
} = require("mineflayer-statemachine");

globalSettings.debugMode = true;

const states = require('./states.js');

bot.on('windowOpen', msg => {
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 4000, firstPerson: true, })
  const targets = {}

  const printServerStates = new BehaviorPrintServerStats(bot);
  const CompassPort = new states.CompassPort(bot, "KompassPort", 2, 29);
  const idleState = new BehaviorIdle();
  const GeheZuCenter = new states.GeheZu(bot, new Vec3(129, 0, -74), "GeheZuCenter", targets);
  const Vorbereiten = new states.Vorbereiten(bot, "Vorbereiten", 50, 50);
  const HoleAxt = new states.HoleItemAusKiste(bot, "Axt holen", ["diamond_axe"], 1, new Vec3(130, 99, -74));
  const HoleSapling = new states.HoleItemAusKiste(bot, "Sapling holen", ["oak_sapling", "birch_sapling", "spruce_sapling", "jungle_sapling", "acacia_sapling", "dark_oak_sapling"],64,new Vec3(130,99,-73));
  const sucheHolz = new states.SucheHolz(bot, "Suche Holz",5);
  const F_AxtNichtGenommen = new states.Failure(bot, "F_AxtNichtGenommen", "Ich benötige eine Axt.", targets);
 const F_OutputKisteVoll=new states.Failure(bot, "F_OutputkisteVoll", "Kein Platz für meine Items", targets);
 const F_SaplingKisteLeer=new states.Failure(bot, "F_SaplingKisteLeer", "Keine Saplings vorhanden", targets);
 const F_AxtKisteLeer=new states.Failure(bot, "F_AxtKisteLeer", "Keine Axt vorhanden", targets);
 const InventarLeere=new states.LeereInv(bot,) 
 const transitions = [
    new StateTransition({ // 
      parent: printServerStates,
      child: GeheZuCenter,
      shouldTransition: () => true
    }),
    new StateTransition({ // 
      parent: GeheZuCenter,
      child: Vorbereiten,
      shouldTransition: () => GeheZuCenter.Reached()
    }),
    new StateTransition({ // 
      parent: Vorbereiten,
      child: HoleAxt,
      shouldTransition: () => Vorbereiten.Done() && Vorbereiten.NoAxe()
    }),
    new StateTransition({ // 
      parent: Vorbereiten,
      child: HoleSapling,
      shouldTransition: () => Vorbereiten.Done() && Vorbereiten.NoSapling()
    }),
    new StateTransition({ // 
      parent: HoleAxt,
      child: Vorbereiten,
      shouldTransition: () => HoleAxt.Done() && HoleAxt.Sucess()
    }),
    new StateTransition({ // 
      parent: HoleAxt,
      child: F_AxtNichtGenommen,
      shouldTransition: () => HoleAxt.Done() && !HoleAxt.Sucess()
    }),
    new StateTransition({ // 
      parent: HoleSapling,
      child: Vorbereiten,
      shouldTransition: () => HoleAxt.Done()
    }),
    new StateTransition({ // 
      parent: sucheHolz,
      child: GeheZuCenter,
      shouldTransition: () => sucheHolz.Done()|| sucheHolz.Fehler()
    }),
    new StateTransition({ // 
      parent: Vorbereiten,
      child: sucheHolz,
      shouldTransition: () => Vorbereiten.Done() && !Vorbereiten.NoSapling() && !Vorbereiten.NoAxe()
    }),
    new StateTransition({ // 
      parent: HoleAxt,
      child: F_AxtKisteLeer,
      shouldTransition: () => states.HoleItemAusKiste.Done() && !states.HoleItemAusKiste.Sucess
    }),
    new StateTransition({ // 
      parent: HoleSapling,
      child: F_SaplingKisteLeer,
      shouldTransition: () => states.HoleItemAusKiste.Done() && !states.HoleItemAusKiste.Sucess
    }),
  ]

  const root = new NestedStateMachine(transitions, printServerStates)
  root.name = 'main'

  bot.on('chat', (username, message) => {
  })

  const stateMachine = new BotStateMachine(bot, root)
  const webserver = new StateMachineWebserver(bot, stateMachine, 12345)
  webserver.startServer();
})