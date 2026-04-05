const {Images,Product} = require('../models');


exports.getPriceByImageId = async (req, res) => {
  const { id } = req.params;
  //const id=7;
  //console.log("ID",id);

  try {
    const image = await Images.findByPk(id, {
      include: {
        model: Product,
        attributes: ['product_id','price'], // only fetch price
      },
    });
    //console.log(image);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    return res.json({ 
      price: image.Product.price,
      productid:image.Product.product_id
     });
  } catch (err) {
    console.error('Error fetching price:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
