Hooks.once("init", () => {
  CONFIG.DND5E.CHARACTER_EXP_LEVELS = [
    0, 300, 750, 1350, 2100, 3000, 4050, 5250, 6600, 8100, 9750, 11550, 13500,
    15600, 17850, 20250, 22800, 25500, 28350, 31350,
  ];
});

Hooks.once("ready", () => {
  for (const actor of game.actors) {
    if (actor.sheet?.rendered) {
      actor.sheet.render(true);
    }
  }
});

Hooks.on("renderHitPointsFlow", (app, html) => {
  const root = html?.[0] ?? html;

  // Força e trava o checkbox "Usar a Média"
  const checkbox = root.querySelector('input[type="checkbox"]');
  if (checkbox) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    checkbox.disabled = true;
  }

  // Esconde a área de OPTIONS
  const optionsSection = root.querySelector(".form-group") 
                      || [...root.querySelectorAll("div")].find(el => 
                           (el.textContent || "").includes("Usar a Média") ||
                           (el.textContent || "").includes("OPTIONS")
                         );

  if (optionsSection) {
    optionsSection.style.display = "none";
  }
});
