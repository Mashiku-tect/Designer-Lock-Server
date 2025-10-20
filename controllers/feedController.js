const { finished } = require('nodemailer/lib/xoauth2');
const { User, Product, Images, Comments,Likes,Follow,Skills } = require('../models');
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
      images: prod.Images.map(img => `https://75056390767e.ngrok-free.app/${img.path.replace(/^\/+/, '')}`),
      likesCount: prod.Likes.length,
      hasliked:prod.Likes.some(like => like.user_id === user_id),
      comments: prod.Comments.map(c => ({
        id: c.id,
        text: c.comment,
        timestamp: c.createdAt,
        user: {
          id: c.User.user_id,
          name: `${c.User.firstname} ${c.User.lastname}`,
          avatar:`https://75056390767e.ngrok-free.app/${c.User.profileimage}` 
        }
      })),
      designer: {
        id: prod.User.user_id,
        name: `${prod.User.firstname} ${prod.User.lastname}`,
        avatar: `https://75056390767e.ngrok-free.app/${prod.User.profileimage.replace(/^\/+/, '')}`,
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
  let hasFollowedThisDesigner=false;
  //console.log('Fetching works for designer ID:', id);
     const user_id = req.user.id;
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

    const UserFollow = await Follow.findOne({
  where: { follower_id: user_id, following_id: id }
});

const hasFollowedThisDesigner = !!UserFollow;


   // console.log('Products fetched:', products);
//console.log('products:', JSON.stringify(products, null, 2));
    const works = products.map(product => ({
      id: product.product_id,
      images: product.Images.map(img => `https://75056390767e.ngrok-free.app/${img.path.replace(/^\/+/, '')}`),
      description: product.designtitle,
      timestamp: product.createdAt,
      //skills: product.Skills.map(skill => skill.skill),
      likes: product.Likes.length,
      hasliked:product.Likes.some(like => like.user_id === user_id),
      category: product.category || 'General', // if category is in Product
    comments: product.Comments.map(comment => ({
  id: comment.id,
  text: comment.comment,
  timestamp: comment.createdAt,
  user: comment.User ? {
    id: comment.User.user_id,
    name: comment.User.firstname + ' ' + comment.User.lastname,
    avatar: `https://75056390767e.ngrok-free.app/${comment.User.profileimage.replace(/^\/+/, '')}`,
  } : {
  id: null,
  name: 'Unknown User',
  avatar: 'https://example.com/default-avatar.png'
}// or provide a fallback user
}))

    }));

    //console.log('Works data prepared:', JSON.stringify(works, null, 2));

    return res.status(200).json({ works,hasFollowedThisDesigner });

  } catch (err) {
    console.error('Error fetching designer works:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//get designer stats
exports.getDesignerStats = async (req, res) => {
  const id = req.params.id;
  const designerId = id;
  //console.log('Designer id',designerId);

  try {
    // 1. Get works (products) with status "completed"
    const worksCount = await Product.count({
      where: {
        user_id: designerId,
        status: 'completed'
      }
    });

    // 2. Count followers (users who follow this designer)
    const followersCount = await Follow.count({
      where: {
        following_id: designerId
      }
    });

    // 3. Count following (users this designer is following)
    const followingCount = await Follow.count({
      where: {
        follower_id: designerId
      }
    });

    // 4. Get total likes across all this designer's products
    const designerProducts = await Product.findAll({
      where: { user_id: designerId },
      attributes: ['product_id']
    });

    const productIds = designerProducts.map(p => p.product_id);

    const totalLikes = await Likes.count({
      where: {
        product_id: {
          [Op.in]: productIds
        }
      }
    });

    //get the designer's skills
    const skills = await Skills.findAll({
      where: { user_id: designerId },
      attributes: ['id','skill']
    });
    //console.log('Designer skills:', skills.map(s => s.skill));

    // Return as clean JSON
    res.json({
      works: worksCount,
      followers: followersCount,
      following: followingCount,
      likes: totalLikes,
      skills: skills.map(s => s.skill),
    });

  } catch (error) {
    console.error('Error fetching designer stats:', error);
    res.status(500).json({ error: 'Failed to fetch designer stats' });
  }
};

//toggle follow designer
exports.toggleFollowDesigner = async (req, res) => {
  const followerId = req.user.id; // current logged in user
  const followingId = req.params.followingId; // designer to follow/unfollow
  //console.log('Follower ID:', followerId, 'Following ID:', followingId);
  let isFollowing=false;
  try {
    const existingFollow = await Follow.findOne({
      where: { follower_id: followerId, following_id: followingId }
    });
    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      return res.json({ isFollowing,message: 'Unfollowed designer' });
    } else {
      // Follow
      await Follow.create({ follower_id: followerId, following_id: followingId });
      isFollowing=true;
      return res.json({ isFollowing,message: 'Followed designer' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};