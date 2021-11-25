import { wod20th } from "./module/config.js";
import wodItemSheet from "./module/sheets/wodItemSheet.js";
import wodItem from "./module/sheets/wodItem.js";
import wodCharacter from "./module/sheets/wodCharacter.js";
import wodCharakcterSheet from "./module/sheets/wodCharakcterSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    //Charakter-Partials
    //"systems/wod20th/templates/partials/character-sheet-header.html",
  ];
  return loadTemplates(templatePaths);
}

Hooks.once("init", function () {
  console.log("Wod | Initialisierung System");

  //CONFIG.Combat.entityClass = wodCombat;
  CONFIG.wod20th = wod20th;
  CONFIG.Actor.entityClass = wodCharacter;
  CONFIG.Item.entityClass = wodItem;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wod20th", wodItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wod20th", wodCharakcterSheet, { makeDefault: true });

  preloadHandlebarsTemplates();

  Handlebars.registerHelper("disabled", function (condition) {
    let d = "";
    if (condition != null || undefined) {
      d = "disabled";
    } else {
      d = "enabled";
    }
    return d;
  });
  Handlebars.registerHelper("times", function (n, content) {
    let result = "";
    for (var i = 0; i < n; ++i) {
      let htmlString = content.fn(n);
      let dataIndexString = "data-index=" + (i + 1) + ">";
      htmlString = htmlString.replace(">", dataIndexString);
      result += htmlString;
    }
    return result;
  });
});
//Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html)); //Wird gebraucht um in eine interaktive Nachricht in der Sidebar zu erzeugen
