import { fromDefaultMapping } from "./babele-converters.js";
import {
  activities,
  advancement,
  effects,
  imperialToMetric,
  pages,
  source,
} from "./converters.js";

const MODULE_ID = "renegados-compendium";

// No need to change the code below this line, but it’s your module so do it if you want!

Hooks.on("ready", () => {
  game.settings.register(MODULE_ID, "autoRegisterBabel", {
    name: "Automatically activate translation via Babele",
    hint: "Automatically implements Babele translations without needing to point to the directory containing the translations.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: (_convert) => {
      if (game.settings.get(MODULE_ID, "autoRegisterBabel")) {
        autoRegisterBabel();
      }

      window.location.reload();
    },
  });

  game.settings.register(MODULE_ID, "convert", {
    name: "Conversões automáticas",
    hint: "Aplica o sistema métrico a todas as medições, distâncias",
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onChange: (_convert) => {
      setEncumbranceData();
      fixExhaustion();
    },
  });

  game.settings.register(MODULE_ID, "autoSourceConfiguration", {
    name: "Configurar Fontes de Compêndio Automaticamente",
    hint: "Configura automaticamente as fontes padrão para os compêndios de D&D 5e.",
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    onChange: (_convert) => {
      setSourceConfiguration();
    },
  });

  if (game.settings.get(MODULE_ID, "autoRegisterBabel")) {
    autoRegisterBabel();
  }

  if (game.settings.get(MODULE_ID, "convert")) {
    setEncumbranceData();
    fixExhaustion();
  }

  if (game.settings.get(MODULE_ID, "autoSourceConfiguration")) {
    setSourceConfiguration();
  }
});

function autoRegisterBabel() {
  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: MODULE_ID,
      lang: "pt-BR",
      dir: "lang/pt-BR/compendium",
    });

    Babele.get().registerConverters({
      items: fromDefaultMapping("Item", "items"),
      range: imperialToMetric("range"),
      weight: imperialToMetric("weight"),
      target: imperialToMetric("target"),
      senses: imperialToMetric("senses"),
      movement: imperialToMetric("movement"),
      sightRange: imperialToMetric("sightRange"),
      rangeActivities: imperialToMetric("rangeActivities"),
      distanceAdvancement: imperialToMetric("distanceAdvancement"),
      pages: pages(),
      source: source(),
      effects: effects(),
      activities: activities(),
      advancement: advancement(),
    });
  }
}

Hooks.once("ready", () => {
  setEncumbranceData();
  fixExhaustion();
  setSourceConfiguration();
});

Hooks.on("createScene", (scene) => {
  if (convertEnabled()) {
    scene.update({ "grid.units": "m", "grid.distance": 1.5 });
  }
});

function convertEnabled() {
  return game.settings.get(MODULE_ID, "convert");
}

function setSourceConfiguration() {
  if (!game.settings.get(MODULE_ID, "autoSourceConfiguration")) return;

  if (game.user.role === 4) {
    game.settings.set("dnd5e", "packSourceConfiguration", {
      "dnd5e.classfeatures": false,
      "dnd5e.classes": false,
      "dnd5e.items": true,
      "dnd5e.monsterfeatures": false,
      "dnd5e.races": false,
      "dnd5e.spells": false,
      "dnd5e.subclasses": false,
      "dnd5e.heroes": false,
      "dnd5e.monsters": false,
      "dnd5e.tradegoods": true,
      "dnd5e.backgrounds": false,
      "dnd5e.rules": true,
      "dnd5e.tables": true,
    });
  }
}

function setEncumbranceData() {
  const convert = convertEnabled();
  game.settings.set("dnd5e", "metricWeightUnits", convert);
  game.settings.set("dnd5e", "metricLengthUnits", convert);
  game.settings.set("dnd5e", "metricVolumeUnits", convert);
  game.settings.set("dnd5e", "rulesVersion", "legacy");
  game.settings.set("core", "chatBubblesPan", false);
  game.settings.set("core", "leftClickRelease", true);

  if (convert) {
    CONFIG.DND5E.movementUnits = {
      m: CONFIG.DND5E.movementUnits.m,
      km: CONFIG.DND5E.movementUnits.km,
      ft: CONFIG.DND5E.movementUnits.ft,
      mi: CONFIG.DND5E.movementUnits.mi,
    };
  }
}

function fixExhaustion() {
  // Fix system bug (2024 rules)
  if (convertEnabled()) {
    CONFIG.DND5E.conditionTypes.exhaustion.reduction =
      foundry.utils.mergeObject(
        CONFIG.DND5E.conditionTypes.exhaustion.reduction,
        { speed: 1.5 },
      );
  }
}
