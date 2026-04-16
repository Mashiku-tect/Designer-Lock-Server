const db = require('../config/db');
const {Images} = require('../models');

exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    //console.log("query",query);
    if (!query) return res.status(400).json({ error: 'Search query required' });

    // const results = await Images.findAll({
    //   where: {
    //     productId: {
    //       [db.Sequelize.Op.like]: `%${query}%`
    //     },
    //     status: {
    //   [db.Sequelize.Op.ne]: 'Deleted' // Exclude products with status 'Deleted'
    // }
    //   }
    // });


    const results = await Images.findAll({
  where: {
    productId: query, // exact match
    status: {
      [db.Sequelize.Op.ne]: 'Deleted'
    }
  }
});

    //console.log(results);

    res.json(results);
  } catch (err) {
   // console.error('Search error:', err);
    res.status(500).json({ message: 'Something went wrong,Please try again' });
  }
};
