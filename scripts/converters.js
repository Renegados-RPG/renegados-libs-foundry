export const sources = {
  "SRD 5.1": "DRS 5.1",
};

export const conversionInfo = {
  ft: {
    converter: footsToMeters,
    units: "m",
  },
  mi: {
    converter: milesToMeters,
    units: "km",
  },
};

export function imperialToMetric(type) {
  return (value) => {
    if (!game.settings.get("renegados-compendium", "convert")) return value;

    switch (type) {
      case "range":
        return range(value);
      case "weight":
        return weight(value);
      case "target":
        return target(value);
      case "senses":
        return senses(value);
      case "movement":
        return movement(value);
      case "sightRange":
        return footsToMeters(value);
      case "rangeActivities":
        return rangeActivities(value);
      case "distanceAdvancement":
        return distanceAdvancement(value);
      default:
        console.warn(`Type: '${type}' not implemented !`);
        break;
    }
  };
}

export function range(range) {
  const conversion = conversionInfo[range.units];
  if (conversion) {
    return foundry.utils.mergeObject(range, {
      value: conversion.converter(range.value),
      long: conversion.converter(range.long),
      reach: conversion.converter(range.reach),
      units: conversion.units,
    });
  } else {
    console.warn(`Range units: '${range.units}' not implemented !`);
  }

  return range;
}

export function weight(weight) {
  if (weight.units === "kg") return weight;

  return foundry.utils.mergeObject(weight, {
    value: lbToKg(weight.value),
    units: "kg",
  });
}

export function target(target) {
  const conversion = conversionInfo[target.template.units];
  if (conversion) {
    return foundry.utils.mergeObject(target, {
      template: {
        size: conversion.converter(target.template.size),
        height: conversion.converter(target.template.height),
        width: conversion.converter(target.template.width),
        units: conversion.units,
      },
      affects: {
        count: conversion.converter(target.affects.count),
      },
    });
  } else {
    console.warn(`Target units: '${target.template.units}' not implemented !`);
  }

  return target;
}

export function senses(senses) {
  const conversion = conversionInfo[senses.units ?? "ft"];
  if (conversion) {
    return foundry.utils.mergeObject(senses, {
      darkvision: conversion.converter(senses.darkvision),
      blindsight: conversion.converter(senses.blindsight),
      tremorsense: conversion.converter(senses.tremorsense),
      truesight: conversion.converter(senses.truesight),
      units: conversion.units,
    });
  } else {
    console.warn(`Senses units: '${senses.units}' not implemented !`);
  }

  return senses;
}

export function movement(movement) {
  const conversion = conversionInfo[movement.units ?? "ft"];
  if (conversion) {
    return foundry.utils.mergeObject(movement, {
      burrow: conversion.converter(movement.burrow),
      climb: conversion.converter(movement.climb),
      swim: conversion.converter(movement.swim),
      walk: conversion.converter(movement.walk),
      fly: conversion.converter(movement.fly),
      units: conversion.units,
    });
  } else {
    console.warn(`Movement units: '${movement.units}' not implemented !`);
  }

  return movement;
}

export function rangeActivities(activities) {
  Object.keys(activities).forEach((key) => {
    range(activities[key].range);

    const conversion = conversionInfo[activities[key].target?.template?.units];
    if (conversion) {
      foundry.utils.mergeObject(activities[key].target.template, {
        size: conversion.converter(activities[key].target.template.size),
        units: conversion.units,
      });
    }
  });

  return activities;
}

export function distanceAdvancement(advancements) {
  advancements.forEach((adv) => {
    if (adv.type === "ScaleValue" && adv.configuration.type === "distance") {
      const conversion = conversionInfo[adv.configuration.distance.units];
      if (conversion) {
        foundry.utils.mergeObject(adv.configuration.distance, {
          units: conversion.units,
        });

        Object.keys(adv.configuration.scale).forEach((key) => {
          foundry.utils.mergeObject(adv.configuration.scale[key], {
            value: conversion.converter(adv.configuration.scale[key].value),
          });
        });
      }
    }
  });
}

export function footsToMeters(ft) {
  if (!ft || Number.isNaN(parseInt(ft, 10))) return ft;

  return round(parseInt(ft, 10) * 0.3);
}

export function milesToMeters(mi) {
  if (!mi || Number.isNaN(parseInt(mi, 10))) return mi;

  return round(parseInt(mi, 10) * 1.5);
}

export function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function lbToKg(lb) {
  if (!lb) return lb;

  return parseInt(lb, 10) / 2;
}

// Override babele pages converters
export function pages() {
  return (pages, translations) => _pages(pages, translations);
}

export function _pages(pages, translations) {
  return pages.map((data) => {
    if (!translations) {
      return data;
    }

    const translation = translations[data._id] || translations[data.name];
    if (!translation) {
      console.warn(`Missing translation : ${data._id} ${data.name}`);
      return data;
    }

    return foundry.utils.mergeObject(data, {
      name: translation.name ?? data.name,
      image: { caption: translation.caption ?? data.image.caption },
      src: translation.src ?? data.src,
      text: { content: translation.text ?? data.text.content },
      video: {
        width: translation.width ?? data.video.width,
        height: translation.height ?? data.video.height,
      },
      system: {
        tooltip: translation.tooltip ?? data.system.tooltip,
        subclassHeader:
          translation.subclassHeader ?? data.system.subclassHeader,
        unlinkedSpells: data.system.unlinkedSpells
          ? unlinkedSpells(
              data.system.unlinkedSpells,
              translation.unlinkedSpells,
            )
          : data.system.unlinkedSpells,
        description: {
          value: translation.description ?? data.system.description?.value,
          additionalEquipment:
            translation.additionalEquipment ??
            data.system.description?.additionalEquipment,
          additionalHitPoints:
            translation.additionalHitPoints ??
            data.system.description?.additionalHitPoints,
          additionalTraits:
            translation.additionalTraits ??
            data.system.description?.additionalTraits,
          subclass: translation.subclass ?? data.system.description?.subclass,
        },
      },
      flags: {
        dnd5e: { title: translation.flagsTitle ?? data.flags.dnd5e?.title },
      },
      translated: true,
    });
  });
}

export function unlinkedSpells(unlinkedSpellsList, translations) {
  if (!translations) return unlinkedSpellsList;

  if (Array.isArray(unlinkedSpellsList)) {
    return unlinkedSpellsList.map((spell) => {
      const translation = translations[spell.name];
      if (translation) {
        return foundry.utils.mergeObject(spell, {
          name: translation.name ?? spell.name,
        });
      }
      return spell;
    });
  }

  return unlinkedSpellsList;
}

export function source() {
  return (source) => _source(source);
}

export function _source(sourceObj) {
  return foundry.utils.mergeObject(sourceObj, {
    book: sources[sourceObj.book],
    custom: sources[sourceObj.custom],
  });
}

export function effects() {
  return (data, translations) => _effects(data, translations);
}

export function _effects(data, translations) {
  if (!translations) {
    return data;
  }
  if (typeof data !== "object") {
    return translations;
  }

  if (Array.isArray(data)) {
    return data.map((effect) => {
      const translation = translations[effect._id] || translations[effect.name];
      if (translation) {
        return foundry.utils.mergeObject(effect, {
          name: translation.name ?? effect.name,
          description: translation.description ?? effect.description,
          changes: effect.changes
            ? effectsChanges(effect.changes, translation.changes)
            : effect.changes,
        });
      }
      return effect;
    });
  }

  return data;
}

export function effectsChanges(changes, translations) {
  const movementSensesType = [
    "system.attributes.movement.burrow",
    "system.attributes.movement.climb",
    "system.attributes.movement.fly",
    "system.attributes.movement.swim",
    "system.attributes.movement.walk",
    "system.attributes.senses.blindsight",
    "system.attributes.senses.darkvision",
    "system.attributes.senses.tremorsense",
    "system.attributes.senses.truesight",
  ];

  changes.forEach((change) => {
    if (change.mode !== 1 && movementSensesType.includes(change.key)) {
      change.value = footsToMeters(change.value);
    }
  });

  if (!translations) return changes;

  if (Array.isArray(changes)) {
    return changes.map((change) => {
      const translation = translations[change.key];
      if (translation) {
        return foundry.utils.mergeObject(change, {
          value: translation ?? change.value,
        });
      }
      return change;
    });
  }

  return changes;
}

export function activities() {
  return (activitiesList, translations) =>
    _activities(activitiesList, translations);
}

export function _activities(activitiesList, translations) {
  if (!translations) return activitiesList;

  Object.keys(activitiesList).forEach((key) => {
    const activity = activitiesList[key];
    const translationKey = activity.name?.length
      ? activity.name
      : activity.type;
    const translation =
      translations[activity._id] || translations[translationKey];
    if (translation) {
      foundry.utils.mergeObject(activity, {
        name: translation.name ?? activity.name,
        activation: {
          condition: translation.condition ?? activity.activation?.condition,
        },
        description: {
          chatFlavor:
            translation.chatFlavor ?? activity.description?.chatFlavor,
        },
        profiles: activity.profiles
          ? summonProfiles(activity.profiles, translation.profiles)
          : activity.profiles,
      });
    }
  });

  return activitiesList;
}

export function summonProfiles(profiles, translations) {
  if (!translations) return profiles;

  if (Array.isArray(profiles)) {
    return profiles.map((profile) => {
      const translation = translations[profile.name];
      if (translation) {
        return foundry.utils.mergeObject(profile, {
          name: translation.name ?? profile.name,
        });
      }
      return profile;
    });
  }

  return profiles;
}

export function advancement() {
  return (advancements, translations) =>
    _advancement(advancements, translations);
}

export function _advancement(advancements, translations) {
  if (!translations) return advancements;

  return advancements.map((adv) => {
    const translation = translations[adv._id] || translations[adv.title];
    if (translation) {
      return foundry.utils.mergeObject(adv, {
        title: translation.title ?? adv.title,
        hint: translation.hint ?? adv.hint,
      });
    }
    return adv;
  });
}
