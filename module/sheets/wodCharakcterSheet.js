import * as DSMechanics from "../wodMechanics.js";

export default class wodCharakcterSheet extends ActorSheet {
  get template() {
    return `systems/wod20th/templates/sheets/actors/${this.actor.data.type}-sheet.html`;
  }
  chatTemplate = {
    Skill: "systems/wod20th/templates/dice/chatSkill.html",
    Custom: "systems/wod20th/templates/dice/chatCustom.html",
    Item: "systems/wod20th/templates/dice/chatItem.html",
    Unarmed: "systems/wod20th/templates/dice/chatUnarmed.html",
    Waffe: "systems/wod20th/templates/dice/chatWeapon.html",
    Panzerung: "systems/wod20th/templates/dice/chatArmor.html",
    Artifizierung: "systems/wod20th/templates/dice/chatCybernetics.html",
  };
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/wod20th/templates/sheets/actors/Character-sheet.html",
      classes: ["wod20th", "sheet", "Charakter"],
      width: 800,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats",
        },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    });
  }

  getData() {
    let data = super.getData();

    //data.config = CONFIG.wod20th;

    // Zusammenstellen aller Gegenstände für die EACH Schleifen auf dem Charakterbogen.

    let itemType = Array.from(
      data.items.map((i) => {
        return i.type;
      })
    );

    for (let i = 0; i < itemType.length; i++) {
      data[itemType[i]] = data.items.filter(function (item) {
        return item.type == itemType[i];
      });
    }

    // /|\
    //  --- Das da sind die Zeilen unten  ---  drunter als FOR-Schleife
    //                                   \|/

    // data.Waffe = data.items.filter(function (item) {return item.type == "Waffe"});
    // data.Artifizierung = data.items.filter(function (item) {return item.type == "Artifizierung"});
    // data.Panzerung = data.items.filter(function (item) {return item.type == "Panzerung"});
    // data.Talent = data.items.filter(function (item) {return item.type == "Talent"});
    // data.Module = data.items.filter(function (item) {return item.type == "Module"});
    // data.Unterbringung = data.items.filter(function (item) {return item.type == "Unterbringung"});
    // data.Gegenstand = data.items.filter(function (item) {return item.type == "Gegenstand"});
    // data.Besonderheiten = data.items.filter(function (item) {return item.type == "Besonderheiten"});

    return data;
  }

  activateListeners(html) {
    /* html.find(cssSelector).event(this._someCallBack.bind(this)); <---- Template */

    super.activateListeners(html);
    html.find(".createItem").click(this._onCreateItem.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".itemToChat").click(this._itemToChat.bind(this));
    html.find(".roleSkill").click(this._onRollSkill.bind(this));
    html.find(".rollItem").click(this._onRollItem.bind(this));
    html.find(".roll-btn").click(this._onCustomRoll.bind(this));
    html.find(".incRess, .decRess").click(this._onModRess.bind(this));
    html
      .find(".decWounds, .incWounds, .decBruises, .incBruises")
      .click(this._onModHealth.bind(this));
    html.find(".changeProp").click(this._onChangeProp.bind(this));
    html.find(".directRoll").click(this._onDirectRoll.bind(this));
    html.find(".ressPoints").click(this._ressPoints.bind(this));
    html.find(".item-quick-edit").change(this._onItemQuickEdit.bind(this));
  }

  createInputData(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const actorData = this.object.data.data;

    let inputData = {
      eventData: element,
      actorId: this.actor.id,
      actorData: actorData,
      removehighest: element.className.includes("disadv"),
    };
    return inputData;
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.object.data.data;

    var dynattr = 0;
    var dynskill = 0;

    var roleData = { attribute: dataset.attr, skill: dataset.skill };

    if (this.actor.type === "DrohneFahrzeug") {
      dynattr = actorData[dataset.attr];
      dynskill = actorData[dataset.skill];

      roleData = { attribute: "", skill: "Modulklasse" };
    } else {
      if (dataset.rolltype != "cybernetic") {
        dynattr = actorData.charattribut[dataset.attr].attribut;
        dynskill = actorData.charattribut[dataset.attr].skill[dataset.skill];
      } else {
        dynattr = actorData.miscData.Kybernese.attribut;
        dynskill = actorData.miscData.Kybernese.bonus;
        roleData = { attribute: "Kybernese", skill: "Artfizierung" };
      }
    }

    // ------------------------- //
    // Bau des Übergabe-Objektes //
    // ------------------------- //

    let preCreatedInput = this.createInputData(event);
    var inputData = {
      ...preCreatedInput,
      dynattr: dynattr,
      dynskill: dynskill,
      roleData: roleData,
    };
    DSMechanics.modRolls(inputData, event);
  }

  async _onCustomRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const actorData = this.object.data.data;
    const dataset = element.dataset;

    let dynattr = actorData.customroll.dice;
    let dynskill = actorData.customroll.bonus;
    let roleData = { attribute: "", skill: "Bonus" };

    let preCreatedInput = this.createInputData(event);
    let inputData = {
      ...preCreatedInput,
      dynattr: dynattr,
      dynskill: dynskill,
      roleData: roleData,
    };

    DSMechanics._resolveDice(inputData, event);
  }

  async _onDirectRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let dynattr = parseInt(dataset.dice);
    let dynskill = parseInt(dataset.bonus);

    var roleData = { attribute: "", skill: dataset.rollname };

    let preCreatedInput = this.createInputData(event);
    let inputData = {
      ...preCreatedInput,
      dynattr: dynattr,
      dynskill: dynskill,
      roleData: roleData,
    };

    DSMechanics.modRolls(inputData, event);
  }

  // ----------------------- //
  // -------- ITEMS -------- //
  // ----------------------- //

  async _onRollItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    var dynattr = 0;
    var dynskill = 0;
    const actorData = this.object.data.data;

    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);

    // -------------------------------- //
    // Charakterdaten für Angriffswürfe //
    // -------------------------------- //

    if (dataset.rolltype == "combat") {
      var skillident = dataset.skill; // Holt den benötigten Skill aus dem Waffenbutton
      var attrident = ""; // Legt Identifikator für Attribut an

      // SKILLIDENTS FÜR CHARAKTERE
      if (this.object.data.type === "Charakter") {
        if (["Kampftechnik", "Schusswaffen"].includes(skillident)) {
          attrident = "Geschick";
        }
        if (["Nahkampfwaffen", "Unterstützungswaffen"].includes(skillident)) {
          attrident = "Konstitution";
        }
      }
      // SKILLIDENTS FÜR NEBENCHARAKTERE
      if (this.object.data.type === "Nebencharakter") {
        if (["Schusswaffen", "Unterstützungswaffen"].includes(skillident)) {
          attrident = "Fernkampf";
        }
        if (["Kampftechnik", "Nahkampfwaffen"].includes(skillident)) {
          attrident = "Nahkampf";
        }
      }

      dynattr = actorData.charattribut[attrident].attribut;
      dynskill = actorData.charattribut[attrident].skill[skillident];
    }

    // ----------------- //
    // Daten für Komfort //
    // ----------------- //

    if (dataset.rolltype === "quarter") {
      console.log(dataset);
      dynattr = dataset.attr;
      dynskill = dataset.skill;
    }

    // ------------------------ //
    // Daten für Kybernesewürfe //
    // ------------------------ //

    if (dataset.rolltype == "cybernetic") {
      dynattr = actorData.miscData.Kybernese.attribut;
      dynskill = parseInt(dataset.skill);
    }
    var roleData = { attribute: attrident, skill: skillident };

    let preCreatedInput = this.createInputData(event);
    let inputData = {
      ...preCreatedInput,
      dynattr: dynattr,
      dynskill: dynskill,
      roleData: roleData,
      item: item,
    };
    DSMechanics.modRolls(inputData, event);
  }

  // ------------- //
  // Item Creation //
  // ------------- //

  async _onCreateItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    var dialogNewItem = await renderTemplate(
      "systems/wod20th/templates/createNewItem/dialogNew" +
        element.dataset.type +
        ".html"
    );

    new Dialog({
      title: "Neuer Gegenstand",
      content: dialogNewItem,
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "OK",
          callback: (html) => {
            var newItemData = {
              name: html.find("[name=newName]")[0].value,
              type: element.dataset.type,
              description: html.find("[name=newDesc]")[0].value,
            };
            if (
              element.dataset.type != "Talent" &&
              element.dataset.type != "Besonderheiten"
            ) {
              newItemData = {
                ...newItemData,
                mk: html.find("[name=newMK]")[0].value,
                size: html.find("[name=newSize]")[0].value,
                modules: html.find("[name=newMods]")[0].value,
              };
            }
            if (
              element.dataset.type != "Unterbringung" &&
              element.dataset.type != "Talent" &&
              element.dataset.type != "Besonderheiten"
            ) {
              newItemData = {
                ...newItemData,
                Eigenschaften: {
                  Computer: html.find("[name=propComputer]")[0].checked,
                  Sensoren: html.find("[name=propSensoren]")[0].checked,
                  Kybernetik: html.find("[name=propKybernetik]")[0].checked,
                },
              };
            }

            let itemData = {
              name: html.find("[name=newName]")[0].value,
              type: newItemData.type,
              data: newItemData,
            };

            console.log(itemData.type);

            return this.actor.createOwnedItem(itemData);
          },
        },
      },
    }).render(true);
  }

  _onItemEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let itemInfo = this.object.data.items.filter((item) => {
      return item._id == itemId;
    })[0];

    Dialog.confirm({
      title: "Gegenstand entfernen",
      content: "Möchtest du " + itemInfo.name + " wirklich löschen?",
      yes: () => {
        ui.notifications.info("Gegenstand gelöscht");
        return this.actor.deleteOwnedItem(
          itemId
        ); /* <-- Wird in Foundry VTT 9.x ersetzt */
      },
      no: () => {},
      defaultYes: true,
    });
  }

  async _itemToChat(event) {
    const element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let itemList = this.object.data.items;
    let itemClicked = itemList.filter((i) => {
      return i.data._id == itemId;
    });

    let itemType = String(
      itemClicked.map((i) => {
        return i.data.type;
      })
    );
    let itemDefaultData = {
      itemName: itemClicked.map((i) => {
        return i.data.name;
      }),
      itemType: itemType,
      itemImg: itemClicked.map((i) => {
        return i.data.img;
      }),
      itemDesc: itemClicked.map((i) => {
        return i.data.data.description;
      }),
    };
    let itemChatData = itemDefaultData;
    if (itemType === "Besonderheiten") {
      itemChatData = {
        ...itemDefaultData,
        type: itemClicked.map((i) => {
          return i.data.data.type;
        }),
      };
    }
    if (itemType === "Talent") {
      itemChatData = {
        ...itemDefaultData,
        attribut: itemClicked.map((i) => {
          return i.data.data.attribut;
        }),
        skill: itemClicked.map((i) => {
          return i.data.data.skill;
        }),
        requirement: itemClicked.map((i) => {
          return i.data.data.requirement;
        }),
      };
    }
    if (itemType === "Gegenstand" || "Artifizierung") {
      itemChatData = {
        ...itemDefaultData,
        itemModules: itemClicked.map((i) => {
          return i.data.data.modules;
        }),
        itemMk: itemClicked.map((i) => {
          return i.data.data.mk;
        }),
        itemSize: itemClicked.map((i) => {
          return i.data.data.size;
        }),
      };
    }
    if (itemType === "Unterbringung") {
      itemChatData = {
        ...itemDefaultData,
        comfort: itemClicked.map((i) => {
          return i.data.data.comfort;
        }),
        ressourcen: itemClicked.map((i) => {
          return i.data.data.ressourcen;
        }),
        crime: itemClicked.map((i) => {
          return i.data.data.crime;
        }),
        polution: itemClicked.map((i) => {
          return i.data.data.polution;
        }),
      };
    }
    let messageData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    };
    let cardData = {
      ...this.data,
      ...itemChatData,
      owner: this.actor.id,
    };
    messageData.content = await renderTemplate(
      this.chatTemplate["Item"],
      cardData
    ); // this.chatTemplate[this.type] --> "this.type" bezieht sich auf die Auswahl von Templates
    return ChatMessage.create(messageData);
  }

  async _onModRess(event) {
    let ressAttr = event.currentTarget.dataset.attr;
    let attrKey = "data.charattribut." + ressAttr + ".ress.value";
    let ressMod = 0;
    if (event.currentTarget.className.includes("decRess")) {
      ressMod = -1;
    }
    if (event.currentTarget.className.includes("incRess")) {
      ressMod = 1;
    }
    let newInc =
      this.actor.data.data.charattribut[ressAttr].ress.value + ressMod;

    this.actor.update({
      id: this.actor.id,
      [attrKey]: newInc,
    });
  }
  async _onModHealth(event) {
    let currHealth = {
      bruises: this.actor.data.data.bruises.value,
      wounds: this.actor.data.data.wounds.value,
    };
    let modBruises;
    let modWounds;

    if (event.currentTarget.className.includes("decBruises")) {
      modBruises = -1;
      modWounds = 0;
    }
    if (event.currentTarget.className.includes("incBruises")) {
      modBruises = 1;
      modWounds = 0;
    }
    if (event.currentTarget.className.includes("decWounds")) {
      modBruises = 0;
      modWounds = -1;
    }
    if (event.currentTarget.className.includes("incWounds")) {
      modBruises = 0;
      modWounds = 1;
    }

    this.actor.update({
      id: this.actor.id,
      "data.bruises.value": currHealth.bruises + modBruises,
      "data.wounds.value": currHealth.wounds + modWounds,
    });
  }
  async _onChangeProp(event) {
    const actordata = this.actor.data.data;
    const element = event.currentTarget;
    const healthMod = await renderTemplate(
      "systems/wod20th/templates/dice/dialogHealthMod.html"
    );
    //const ressMod = await renderTemplate("systems/wod20th/templates/dice/dialogRessMod.html");

    console.log(element.dataset.fieldtype);

    // Testet welcher Property-Button gedrückt wurde //
    if (element.dataset.fieldtype === "health") {
      console.log("Test");
      let bruisesBonus;
      let woundsBonus;
      new Dialog({
        title: "Gesundheit modifizieren",
        content: healthMod,
        buttons: {
          button1: {
            label: "OK",
            callback: (html) => {
              bruisesBonus = parseInt(
                html.find("[name=bruisesBonusInput]")[0].value
              );
              woundsBonus = parseInt(
                html.find("[name=woundsBonusInput]")[0].value
              );
            },
            icon: `<i class="fas fa-check"></i>`,
          },
        },
        close: () => {
          this.actor.update({
            id: this.actor.id,
            "data.bruises.bonus": bruisesBonus,
            "data.wounds.bonus": woundsBonus,
          });
        },
      }).render(true);
    }
  }

  async _onItemQuickEdit(event) {
    const id = $(event.currentTarget).parents(".item").attr("data-item-id");
    const target = $(event.currentTarget).attr("data-target");
    const item = duplicate(this.actor.getEmbeddedDocument("Item", id));
    let targetValue;

    if (event.target.type === "checkbox") {
      targetValue = event.target.checked;
    } else {
      targetValue = event.target.value;
    }

    setProperty(item, target, targetValue);
    this.actor.updateEmbeddedDocuments("Item", [item]);
  }

  _ressPoints(event) {
    const actorData = this.object.data.data;
    const element = event.currentTarget;

    let currentIndex = parseInt(element.dataset.index);
    let currentActive = parseInt(element.dataset.active);
    let currentAttr = element.dataset.thisattr;
    let currentAttrData = actorData.charattribut[currentAttr];
    let ValueAdress = "data.charattribut." + currentAttr + ".ress.value";

    if (currentActive === 1) {
      this.actor.update({
        id: this.actor.id,
        [ValueAdress]: currentIndex,
      });
    } else {
      this.actor.update({
        id: this.actor.id,
        [ValueAdress]: currentAttrData.ress.value + currentIndex,
      });
    }
  }
}
