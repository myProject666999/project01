const TeaProduct = require('./TeaProduct');
const StorageLocation = require('./StorageLocation');
const Inventory = require('./Inventory');
const EnvironmentRecord = require('./EnvironmentRecord');
const TastingNote = require('./TastingNote');
const TastingInfusion = require('./TastingInfusion');
const Alert = require('./Alert');

const setupAssociations = () => {
  TeaProduct.hasMany(Inventory, { foreignKey: 'tea_product_id', as: 'inventory' });
  TeaProduct.hasMany(TastingNote, { foreignKey: 'tea_product_id', as: 'tastingNotes' });

  StorageLocation.hasMany(Inventory, { foreignKey: 'location_id', as: 'inventory' });
  StorageLocation.hasMany(EnvironmentRecord, { foreignKey: 'location_id', as: 'environmentRecords' });
  StorageLocation.hasMany(Alert, { foreignKey: 'location_id', as: 'alerts' });

  Inventory.belongsTo(TeaProduct, { foreignKey: 'tea_product_id', as: 'teaProduct' });
  Inventory.belongsTo(StorageLocation, { foreignKey: 'location_id', as: 'location' });

  EnvironmentRecord.belongsTo(StorageLocation, { foreignKey: 'location_id', as: 'location' });

  TastingNote.belongsTo(TeaProduct, { foreignKey: 'tea_product_id', as: 'teaProduct' });
  TastingNote.hasMany(TastingInfusion, { foreignKey: 'tasting_note_id', as: 'infusions' });

  TastingInfusion.belongsTo(TastingNote, { foreignKey: 'tasting_note_id', as: 'tastingNote' });

  Alert.belongsTo(StorageLocation, { foreignKey: 'location_id', as: 'location' });
};

module.exports = setupAssociations;
