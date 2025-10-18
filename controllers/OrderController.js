const {Product,User,Images}  = require('../models');
const slugify = require('slugify'); // install this package with `npm install slugify`


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
   
  } = req.body;

  try {
    if (!clientname) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const product_id = await generateUniqueProductId(clientname, designtitle);

    // 1. Create product
    const newProduct = await Product.create({
      productname: designtitle,
      clientname,
      clientphonenumber,
      price,
      
      user_id: req.user.id,
      product_id,
      designtitle,
    });

    // 2. Save each image path in the Images table
    if (req.files && req.files.length > 0) {
      const imageEntries = req.files.map(file => ({
        productId: product_id, // assuming your column is camelCase in Sequelize
        path: file.path.replace(/\\/g, '/')
      }));

      //console.log("product id is",product_id);

      // Bulk insert into Images table
      await Images.bulkCreate(imageEntries);
    }

    // 3. Increment user's post count
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
   
     //if current order status is Completed,Perform a soft delete else a hard delete
     if(order.status === 'Completed'){
//Perform Soft Delete by setting is_visible to false
    await Product.update(
      { softdeleted: true },
      { where: { product_id: productId, user_id } }
    );
     }
     else{
//Perform Hard Delete
    await Product.destroy({ where: { product_id: productId, user_id } });
  //also delete all images associated with that product
  await Images.destroy({ where: { productId } });
     }
    

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


//edit order function beggins

exports.EditOrder=async (req,res)=>{
const {orderid}=req.params;
const {clientname,clientphonenumber,designtitle,price}=req.body;
const product_id=orderid;
const product=await Product.findByPk(product_id);
if(!product){
    return res.status(404).json({message:"Order Not Found"});
}
Product.update({
    clientname,
    clientphonenumber,
    designtitle,
    productname:designtitle,
    price
},{
    where:{product_id:product_id}
})

await Images.destroy({
      where: { productId: product_id}
    });

     if (req.files && req.files.length > 0) {
      const imageEntries = req.files.map(file => ({
        productId: product_id, // assuming your column is camelCase in Sequelize
        path: file.path.replace(/\\/g, '/')
      }));

      //console.log("existing files are there");

      // Bulk insert into Images table
      await Images.bulkCreate(imageEntries);
    }
    else{
         return res.status(400).json({message:"Provide Files To Upload"});
    }

    return res.status(200).json({message:"Order Updated Successfully"})
}
