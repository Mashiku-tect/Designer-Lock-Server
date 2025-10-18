
const {Payment,Product} = require('../models'); // Assuming Payment is a model for payments  


exports.checkPaymentStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {productid} = req.body;
    
    const product_id=productid;

    const product = await Product.findByPk(product_id);

    //console.log(product)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Automatically consider the owner as "hasPaid"
    if (product.user_id === user_id) {
      return res.json({ hasPaid: true });
    }

    // Check if the current user has paid for the product
    const payment = await Payment.findOne({
      where: { user_id, product_id,status:"SUCCESS" },
    });

    if (!payment) {
  //console.log(`User ${user_id} has not paid for product ${product_id}`);
  return res.json({ hasPaid: false });
}

//console.log(`User ${user_id} has paid for product ${product_id}`);
return res.json({ hasPaid: true });

  } catch (error) {
    console.error('Check payment error:', error);
    return res.status(500).json({ error: 'Server error checking payment status' });
  }
};



exports.payForProduct = async (req, res) => {
  try {
   
    const user_id = req.user.id;
    const {productid,amount}=req.body;
    const product_id=productid;
    const product = await Product.findByPk(product_id);
  

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Optional: match amount
    if (parseFloat(product.price) !== parseFloat(amount)) {
      return res.status(400).json({ error: 'Incorrect amount' });
    }

    const alreadyPaid = await Payment.findOne({ where: { user_id, product_id } });
    if (alreadyPaid) {
      return res.status(400).json({ error: 'Already paid for this product' });
    }

    await Payment.create({ user_id, product_id, amountpaid:amount });

    //res.json({ success: true });

    // Update product status to 'Completed'
  await Product.update(
    { status: 'Completed' },
    {
      where: {
        product_id: product_id,
        
      }
    }
  );

  return res.json({success: true , hasPaid: true });


  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
};
