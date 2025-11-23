const cuid = require("cuid");
const db = require("./db");

/**
 * Order Schema
 * Tracks customer orders and referenced product IDs.
 */
const Order = db.model("Order", {
  _id: { type: String, default: cuid },

  buyerEmail: { type: String, required: true },

  products: [
    {
      type: String,
      ref: "Product",  // reference Product documents
      required: true,
      index: true,
    },
  ],

  status: {
    type: String,
    enum: ["CREATED", "PENDING", "COMPLETED"],
    default: "CREATED",
    index: true,
  },
});

/* --------------------------------------------------
   ORDER SERVICE FUNCTIONS (CRUD)
----------------------------------------------------*/

/**
 * List orders with optional filters:
 * - productId
 * - status
 * - pagination
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, productId, status } = options;

  const query = {};
  if (productId) query.products = productId;
  if (status) query.status = status;

  return await Order.find(query)
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit);
}

/**
 * Get one order with product details populated
 */
async function get(id) {
  const order = await Order.findById(id)
    .populate("products")
    .exec();

  return order;
}

/**
 * Create a new order
 */
async function create(fields) {
  const order = await new Order(fields).save();
  await order.populate("products");
  return order;
}

/**
 * Update an order by ID
 */
async function edit(id, changes) {
  const order = await get(id);
  if (!order) return null;

  Object.keys(changes).forEach((key) => {
    order[key] = changes[key];
  });

  await order.save();
  await order.populate("products");

  return order;
}

/**
 * Delete an order
 */
async function destroy(id) {
  return await Order.deleteOne({ _id: id });
}

/**
 * Export all CRUD functions
 */
module.exports = {
  list,
  get,
  create,
  edit,
  destroy,
};