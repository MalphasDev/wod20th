import * as DSMechanics from "../wodMechanics.js";
export default class wodItem extends Item {
  prepareData() {
    super.prepareData();

    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};

    const data = itemData.data;
  }

  async _preCreate(createData, options, user) {
    await super._preCreate(createData, options, user);

    let itemType = createData.type;

    // add token default settings
    const updateData = {};
    updateData["img"] =
      "systems/darkspace/icons/itemDefault/itemIcon_" + itemType + ".svg";
    console.log(updateData);
    await this.data.update(updateData);
  }
}
