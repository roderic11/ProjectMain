const mongoose = require('mongoose');

const BomSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  location: {
    type: String,
  },
  subject: {
    type: String,
  },


  items: [
    {
      category: String,
      subCategory:String,
      product: String,
      unit: String,
      quantity: Number,
      fixedQuantity:Number,
    }
  ]
});

module.exports = mongoose.model('BOM', BomSchema);
