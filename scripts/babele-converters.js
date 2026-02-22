export function fromDefaultMapping(_entityType, mappingKey) {
  return (entities, translations, _data, tc) => {
    if (!game?.babele) return entities;

    const babeleTranslations = game.babele.translations.find(
      (item) => item.collection === tc.metadata.id,
    );
    const customMapping = babeleTranslations?.mapping
      ? (babeleTranslations?.mapping[mappingKey] ?? {})
      : {};

    return entities.map((entity) => {
      if (translations) {
        let translation;
        if (Array.isArray(translations)) {
          translation = translations.find(
            (t) => t.id === entity._id || t.id === entity.name,
          );
        } else {
          translation = translations[entity._id] || translations[entity.name];
        }

        if (translation) {
          // simplified mapping for this specific case as we don't have the full CompendiumMapping class
          const translatedData =
            customMapping && Object.keys(customMapping).length > 0
              ? entity // We'd ideally want the mapping but this is a stub for functionality without the babele class directly
              : translation;

          return foundry.utils.mergeObject(
            entity,
            foundry.utils.mergeObject(translatedData, { translated: true }),
          );
        }
      }

      const pack = game.babele.packs.find(
        (pack) => pack.translated && pack.hasTranslation(entity),
      );
      return pack ? pack.translate(entity) : entity;
    });
  };
}
