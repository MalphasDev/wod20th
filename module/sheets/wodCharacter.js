//import { darkspace } from "../config";

export default class DSCharacter extends Actor {
  prepareData() {
    super.prepareData();

    const event = new Event("click");

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.

    console.log(actorData);

    data.statMax = 5;

    let statNames = Object.keys(data.attributes);
    for (var i = 0; statNames.length > i; i++) {
      let attrStat = data.attributes[statNames[i]].maps((a) => {
        return a;
      });
      console.log(attrStat);
      console.log();
      //for (var j = 0; )
      //data[statNames[i]].remaining = data.statMax - data[statNames[i]];
    }

    if (this.type === "Vampir") {
    }

    if (this.type === "Mensch") {
    }

    if (this.type === "Ghul") {
    }
  }
  async _preCreate() {
    // Player character configuration
    if (this.type === "Charakter") {
      this.data.token.update({ vision: true, actorLink: true, disposition: 1 });
    }
  }
}
