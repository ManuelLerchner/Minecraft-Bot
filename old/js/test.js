// Create your bot
const mineflayer = require("mineflayer");
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const bot = mineflayer.createBot(
  {
    host: '',
    password: '',
    username: ''
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
  //bot.chat("/msg ManuelNotManni Hi");
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 4000, firstPerson: true, })
  const targets = {}

  const printServerStates = new BehaviorPrintServerStats(bot);
  const CompassPort = new states.CompassPort(bot, "KompassPort", 2, 29);
  const idleState = new BehaviorIdle();
  const Cobble1 = new states.GeheZu(bot, new Vec3(261, 0, 261), "Cobble1", targets);
  const Cobble1Abbauen = new states.Abbauen(bot, new Vec3(263, 101, 261), new Vec3(263, 101, 262), "Cobble1Abbauen", 40, 40 + 5, targets);
  const Cobble2 = new states.GeheZu(bot, new Vec3(241, 0, 262), "Cobble2", targets);
  const Cobble2Abbauen = new states.Abbauen(bot, new Vec3(239, 101, 262), new Vec3(239, 101, 261), "Cobble2Abbauen", 40, 40 + 5, targets);
  const GeheZuLeereItems = new states.GeheZu(bot, new Vec3(250, 0, 263), "GeheZuLeereItems", targets);
  const LeereItems = new states.LeereInv(bot, new Vec3(250, 101, 265), "LeereInventar", targets);
  const GeheZuHolePicke = new states.GeheZu(bot, new Vec3(252, 0, 263), "GeheZuHolePicke", targets);
  const HolePicke = new states.HolePicke(bot, new Vec3(252, 101, 265), "HolePicke", targets);
  const F_ItemKisteVoll = new states.Failure(bot, "F_ItemKisteVoll", "Ich kann nichts mehr in die Kiste legen.", targets);
  const F_PickeKisteLeer = new states.Failure(bot, "F_PickeKisteLeer", "Ich habe keine Spitzhacken mehr.", targets);

  const transitions = [

    new StateTransition({ // 
      parent: HolePicke,
      child: F_PickeKisteLeer,
      name: 'F_PickeKisteLeer',
      shouldTransition: () => (HolePicke.Done() && HolePicke.ChestEmpty())
    }),
    new StateTransition({ // 
      parent: LeereItems,
      child: F_ItemKisteVoll,
      name: 'F_ItemKisteVoll',
      shouldTransition: () => LeereItems.ChestFull()
    }),

    new StateTransition({ // 
      parent: printServerStates,
      child: CompassPort,
      shouldTransition: () => true
    }),
    new StateTransition({ // 
      parent: CompassPort,
      child: idleState,
      shouldTransition: () => CompassPort.Done()
    }),
    new StateTransition({ // 
      parent: Cobble2Abbauen,
      child: GeheZuLeereItems,
      name: 'Inventar leeren',
      shouldTransition: () => Cobble2Abbauen.NoPickaxe()
    }),
    new StateTransition({ // 
      parent: Cobble1Abbauen,
      child: GeheZuLeereItems,
      name: 'Inventar leeren',
      shouldTransition: () => Cobble1Abbauen.NoPickaxe()
    }),
    new StateTransition({ // 
      parent: idleState,
      child: Cobble1,
      name: 'Laufe zu Cobble 1',
      shouldTransition: () => true
      //onTransition: () => bot.chat('Beginne')
    }),
    new StateTransition({ // 
      parent: Cobble1,
      child: Cobble1Abbauen,
      name: 'Mine Cobble 1',
      shouldTransition: () => Cobble1.Reached(),
    }),
    new StateTransition({ // 
      parent: Cobble1Abbauen,
      child: Cobble2,
      name: 'Laufe zu Cobble 2',
      shouldTransition: () => Cobble1Abbauen.Done()
    }),
    new StateTransition({ // 
      parent: Cobble2,
      child: Cobble2Abbauen,
      name: 'Mine Cobble 2',
      shouldTransition: () => Cobble2.Reached()
    }),
    new StateTransition({ // 
      parent: Cobble2Abbauen,
      child: idleState,
      name: 'Back to Idle',
      shouldTransition: () => Cobble2Abbauen.Done()
    }),
    new StateTransition({ // 
      parent: GeheZuLeereItems,
      child: LeereItems,
      name: 'Inventar leeren',
      shouldTransition: () => GeheZuLeereItems.Reached()
    }),
    new StateTransition({ // 
      parent: LeereItems,
      child: GeheZuHolePicke,
      name: 'Lege in Kiste',
      shouldTransition: () => (LeereItems.Done() && !LeereItems.ChestFull())
    }),
    new StateTransition({
      parent: GeheZuHolePicke,
      child: HolePicke,
      name: 'Picke aus Kiste nehmen',
      shouldTransition: () => GeheZuHolePicke.Reached()
    }),
    new StateTransition({ // 
      parent: HolePicke,
      child: idleState,
      name: 'Back to idle',
      shouldTransition: () => (HolePicke.Done())
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