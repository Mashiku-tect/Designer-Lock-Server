const Product  = require('../models/Product');
const slugify = require('slugify'); // install this package with `npm install slugify`
const User = require('../models/User');

// Helper to generate a unique productId
async function generateUniqueProductId(clientName, designTitle) {
  const baseId = `${clientName.trim().toLowerCase().replace(/\s+/g, '_')}_${designTitle.trim().toLowerCase().replace(/\s+/g, '_')}`;
  let product_id = baseId;
  let suffix = 1;

  while (await Product.findOne({ where: { product_id } })) {
    product_id = `${baseId}${suffix}`;
    suffix++;
  }

  return product_id;
}

//end of function
// Controller function to create a new order

exports.createOrder = async (req, res) => {
  const {
      designtitle,
      clientname,
      clientphonenumber,
      price,
      additionalnotes
    } = req.body;

  try {
    if (!clientname) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const product_id = await generateUniqueProductId(clientname,designtitle);
    const productiPath = req.files.map((file) => file.path); // array of paths

    const newProduct = await Product.create({

     productname: designtitle,
      clientname,
      clientphonenumber,
      price,
      additionalnotes,
      user_id: req.user.id, // make sure auth middleware sets this
      product_id,
      designtitle,
      productimagepath:productiPath.join(',') // join paths into a string
      
    });

     // 2. Increment user's posts count by 1
    await User.increment('posts', { where: { user_id: req.user.id } });

    return res.status(201).json({
      message: `Product created successfully with ID: ${product_id}`,
      productId: product_id,
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/orders/:productId
exports.deleteOrder = async (req, res) => {
  const user_id = req.user.id;
  const { productId } = req.params;

  try {
    const order = await Product.findOne({ where: { product_id: productId, user_id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
   

    //Perform Soft Delete by setting is_visible to false
    await Product.update(
      { is_visible: false,status: 'Deleted' },
      { where: { product_id: productId, user_id } }
    );

    // Decrease user's post count by 1 only if the order was in progress
     if (order.status === 'In Progress') {
    await User.decrement('posts', {
      where: { user_id }
    });
    }

    

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
//end of delete order function
