const { User, Product, Images, Comments,Likes } = require('../models');
const { Op } = require('sequelize');

exports.getFeed = async (req, res) => {
   // console.log('getFeed called');
   const user_id = req.user.id;
  try {
    const products = await Product.findAll({
          where: {
      user_id: {
        [Op.ne]: user_id  // Not equal to the current user
      }
    },
      include: [
        {
          model: User,
          attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage', 'phonenumber','professionalsummary','education','work','location'],
        },
        {
          model: Images,
          attributes: ['id', 'path'], // or your image field name
        },
        {
          model: Comments,
          include: [
            {
              model: User,
              attributes: ['user_id', 'firstname', 'lastname', 'profileimage'],
            }
          ],
          attributes: ['id', 'comment', 'createdAt', 'user_id', 'product_id']
        },
          {
            model: Likes,
            attributes:['id','user_id','product_id']
          }

        
       
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    });

    // Transform to a shape that frontend expects
    const feedData = products.map(prod => ({
      id: prod.product_id,
      description: prod.designtitle,
      images: prod.Images.map(img => `https://d8d19e090095.ngrok-free.app/${img.path.replace(/^\/+/, '')}`),
      likesCount: prod.Likes.length,
      hasliked:prod.Likes.some(like => like.user_id === user_id),
      comments: prod.Comments.map(c => ({
        id: c.id,
        text: c.comment,
        timestamp: c.createdAt,
        user: {
          id: c.User.user_id,
          name: `${c.User.firstname} ${c.User.lastname}`,
          avatar: c.User.profileimage
        }
      })),
      designer: {
        id: prod.User.user_id,
        name: `${prod.User.firstname} ${prod.User.lastname}`,
        avatar: `https://d8d19e090095.ngrok-free.app/${prod.User.profileimage.replace(/^\/+/, '')}`,
        bio: prod.User.bio,
        phone: prod.User.phonenumber,
        professionalsummary: prod.User.professionalsummary,
        education: prod.User.education,
        work: prod.User.work,
        location: prod.User.location
      },
      timestamp: prod.createdAt
    }));
//console.log('Feed data prepared:', feedData);
    return res.json({ feed: feedData });
  } catch (err) {
    console.error('getFeed error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


//get designers works
exports.getDesignerWorks = async (req, res) => {
  const id = req.params.id;
  //console.log('Fetching works for designer ID:', id);
   const designerId=id;
  try {
    const products = await Product.findAll({
      where: { user_id: designerId }, // assuming 'userId' in Product is foreign key to User
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Images,
          
          attributes: ['id','path'], // Assuming each image has a URL
        },
        {
          model:Likes,
          attributes:['id','user_id','product_id']
        },
        {
          model: Comments,
          include: [
            {
              model: User,
              attributes: ['user_id', 'firstname','lastname', 'profileimage'], // or 'avatar'
            },
          ],
          attributes: ['id', 'comment', 'createdAt'],
        },
      ],
    });

   // console.log('Products fetched:', products);
//console.log('products:', JSON.stringify(products, null, 2));
    const works = products.map(product => ({
      id: product.product_id,
      images: product.Images.map(img => `https://d8d19e090095.ngrok-free.app/${img.path.replace(/^\/+/, '')}`),
      description: product.designtitle,
      timestamp: product.createdAt,
      likes: product.Likes.length,
    hasliked:product.Likes.some(like => like.user_id === id),
      category: product.category || 'General', // if category is in Product
    comments: product.Comments.map(comment => ({
  id: comment.id,
  text: comment.comment,
  timestamp: comment.createdAt,
  user: comment.User ? {
    id: comment.User.user_id,
    name: comment.User.firstname + ' ' + comment.User.lastname,
    avatar: `https://d8d19e090095.ngrok-free.app${comment.User.profileimage.replace(/^\/+/, '')}`,
  } : {
  id: null,
  name: 'Unknown User',
  avatar: 'https://example.com/default-avatar.png'
}// or provide a fallback user
}))

    }));

    //console.log('Works data prepared:', works);
    return res.status(200).json({ works });

  } catch (err) {
    console.error('Error fetching designer works:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};