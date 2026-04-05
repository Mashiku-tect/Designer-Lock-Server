const { finished } = require('nodemailer/lib/xoauth2');
const { User, Product, Images, Comments,Likes,Follow,Skills } = require('../models');
const { Op ,literal} = require('sequelize');
const axios = require("axios");


function applyCreatorDiversity(items, limit, maxPerCreator = 2) {

 // console.log('items',items)
  const result = [];
  const creatorCount = new Map();

  for (const item of items) {
    const creatorId = item.prod.user_id;
    //console.log('creator id is',creatorId)
    const count = creatorCount.get(creatorId) || 0;
   // console.log('creator id is',creatorId);
   // console.log('and his count is',count);

    if (count < maxPerCreator) {
      result.push(item);
      creatorCount.set(creatorId, count + 1);
    }

    if (result.length === limit) break;
  }

  return result;
}

// exports.getFeed = async (req, res) => {
//   const user_id = req.user.id;

//   const limit = parseInt(req.query.limit, 10) || 10;
//   const cursor = req.query.cursor; // ISO string

//   try {
//     const whereClause = {
//       isPublic: true,
//       status: 'Completed',
//     };

//     // Cursor condition
//     if (cursor) {
//       whereClause.createdAt = {
//         [Op.lt]: new Date(cursor),
//       };
//     }

//     const products = await Product.findAll({
//       where: whereClause,
//       limit: limit + 1, // fetch one extra to check hasMore
//       order: [['createdAt', 'DESC']],
//       include: [
//         {
//           model: User,
//           attributes: [
//             'user_id',
//             'firstname',
//             'lastname',
//             'bio',
//             'profileimage',
//             'phonenumber',
//             'professionalsummary',
//             'education',
//             'work',
//             'location',
//           ],
//         },
//         {
//           model: Images,
//           attributes: ['id', 'path'],
//         },
//         {
//           model: Comments,
//           attributes: ['id', 'comment', 'createdAt', 'user_id', 'product_id'],
//           include: [
//             {
//               model: User,
//               attributes: ['user_id', 'firstname', 'lastname', 'profileimage'],
//             },
//           ],
//         },
//         {
//           model: Likes,
//           attributes: ['id', 'user_id', 'product_id'],
//         },
//       ],
//     });

//     //console.log("products length",products.length)

//     const hasMore = products.length > limit;
// //console.log('has More',hasMore)
//     // Remove the extra record if it exists
//     const slicedProducts = hasMore ? products.slice(0, limit) : products;

//     const feedData = slicedProducts.map(prod => ({
//       id: prod.product_id,
//       description: prod.Caption || '',
//       images: prod.Images.map(
//         img => `${process.env.SERVER_URL}/${img.path.replace(/^\/+/, '')}`
//       ),
//       likesCount: prod.Likes.length,
//       hasliked: prod.Likes.some(like => like.user_id === user_id),
//       comments: prod.Comments.map(c => ({
//         id: c.id,
//         text: c.comment,
//         timestamp: c.createdAt,
//         user: {
//           id: c.User.user_id,
//           name: `${c.User.firstname} ${c.User.lastname}`,
//           avatar: `${process.env.SERVER_URL}/${c.User.profileimage}`,
//         },
//       })),
//       designer: {
//         id: prod.User.user_id,
//         name: `${prod.User.firstname} ${prod.User.lastname}`,
//         avatar: `${process.env.SERVER_URL}/${prod.User.profileimage.replace(/^\/+/, '')}`,
//         bio: prod.User.bio,
//         phone: prod.User.phonenumber,
//         professionalsummary: prod.User.professionalsummary,
//         education: prod.User.education,
//         work: prod.User.work,
//         location: prod.User.location,
//       },
//       timestamp: prod.createdAt,
//     }));

//     const nextCursor =
//       feedData.length > 0
//         ? feedData[feedData.length - 1].timestamp
//         : null;

//     return res.json({
//       feed: feedData,
//       nextCursor,
//       hasMore,
//     });
//   } catch (err) {
//     console.error('getFeed error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

exports.getFeed = async (req, res) => {
  const user_id = req.user.id;
  //console.log('user id',user_id)
  const limit = parseInt(req.query.limit, 10) || 10;
  const cursor = req.query.cursor;
 // console.log('cursor is', cursor);

  try {
    const whereClause = {
      isPublic: true,
      status: 'Completed',
      softdeleted: false,
    };

    // ----------------- COMPOSITE CURSOR LOGIC -----------------
    // cursor format: "<ISO timestamp>::<product_id>"
    let cursorDate = null;
    let cursorId = null;

    if (cursor) {
      const [dateStr, id] = cursor.split('::');
      cursorDate = new Date(dateStr);
      cursorId = id;

      // posts older than cursor OR same timestamp but smaller product_id
      whereClause[Op.or] = [
        { createdAt: { [Op.lt]: cursorDate } },
        { 
          createdAt: cursorDate,
          product_id: { [Op.lt]: cursorId }
        }
      ];
    }

    // Pull extra candidates for ranking + diversity
    const CANDIDATE_LIMIT = limit * 4;

    const products = await Product.findAll({
      where: whereClause,
      limit: CANDIDATE_LIMIT,
      subQuery: false,
      attributes: {
        include: [
          // Follow priority
[
  literal(`(
    SELECT 1 FROM follows
    WHERE follows.follower_id = '${user_id}'
    AND follows.following_id = Product.user_id
    LIMIT 1
  )`),
  'is_followed',
],


          // Age in hours
          [
            literal(`GREATEST(TIMESTAMPDIFF(HOUR, Product.createdAt, NOW()), 1)`),
            'age_hours',
          ],
        ],
      },
      order: [['createdAt', 'DESC']], // base order
      include: [
        {
          model: User,
          attributes: [
            'user_id',
            'firstname',
            'lastname',
            'bio',
            'profileimage',
            'phonenumber',
            'professionalsummary',
            'education',
            'work',
            'location',
            'posts',
          ],
        },
        {
          model: Images,
          attributes: ['id', 'path'],
        },
        {
          model: Comments,
          limit: 3,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'comment', 'createdAt', 'user_id'],
          include: [
            {
              model: User,
              attributes: ['user_id', 'firstname', 'lastname', 'profileimage'],
            },
          ],
        },
        {
          model: Likes,
          attributes: ['user_id'],
        },
      ],
    });

    /* -------------------- SCORING -------------------- */

    const ranked = products.map(prod => {
      const ageHours = prod.get('age_hours');
      const likes = prod.Likes.length || 0;
      const commentsCount = prod.Comments.length;
      const isFollowed = prod.get('is_followed') ? 1 : 0;

      const engagementVelocity = (likes + commentsCount * 2) / ageHours;
      const recencyScore = Math.exp(-ageHours / 24);

      const score =
        isFollowed * 50 +
        likes * 2 +
        commentsCount * 4 +
        engagementVelocity * 10 +
        recencyScore * 30;

      return { prod, score };
    });

    // Rank by score
    ranked.sort((a, b) => b.score - a.score);

    /* -------------------- EXPLORATION -------------------- */

    const EXPLORE_RATIO = 0.15; // 15%
    const exploreLimit = Math.max(1, Math.floor(limit * EXPLORE_RATIO));
    const followedLimit = limit - exploreLimit;

    const followedPosts = [];
    const explorePosts = [];

    for (const item of ranked) {
      if (item.prod.get('is_followed')) followedPosts.push(item);
      else explorePosts.push(item);
    }

    // Lightly random top exploration posts
    const exploreSelection = explorePosts
      .slice(0, exploreLimit * 3)
      .sort(() => Math.random() - 0.5)
      .slice(0, exploreLimit);

    const mixed = [
      ...followedPosts.slice(0, followedLimit),
      ...exploreSelection,
    ];

    /* -------------------- CREATOR DIVERSITY -------------------- */
    const diversified = applyCreatorDiversity(mixed, limit, 2);

    // ----------------- HAS MORE -----------------
    const hasMore = ranked.length > diversified.length;

    /* -------------------- RESPONSE SHAPING -------------------- */

    const feedData = diversified.map(({ prod }) => ({
      id: prod.product_id,
      description: prod.Caption || '',
      images: prod.Images.map(img =>
        `${process.env.SERVER_URL}/${img.path.replace(/^\/+/, '')}`
      ),
      likesCount: prod.Likes.length,
      hasliked: prod.Likes.some(l => l.user_id === user_id),
      comments: prod.Comments.map(c => ({
        id: c.id,
        text: c.comment,
        timestamp: c.createdAt,
        user: {
          id: c.User.user_id,
          name: `${c.User.firstname} ${c.User.lastname}`,
          avatar: `${process.env.SERVER_URL}/${c.User.profileimage}`,
        },
      })),
      designer: {
        id: prod.User.user_id,
        name: `${prod.User.firstname} ${prod.User.lastname}`,
        avatar: `${process.env.SERVER_URL}/${prod.User.profileimage}`,
        bio: prod.User.bio,
        phone: prod.User.phonenumber,
        professionalsummary: prod.User.professionalsummary,
        education: prod.User.education,
        work: prod.User.work,
        location: prod.User.location,
      },
      timestamp: prod.createdAt,
    }));

    // ----------------- NEXT CURSOR -----------------
    const nextCursor =
      feedData.length > 0
        ? `${feedData[feedData.length - 1].timestamp.toISOString()}::${feedData[feedData.length - 1].id}`
        : null;

    return res.json({
      feed: feedData,
      nextCursor,
      hasMore,
    });
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
      where: { user_id: designerId ,isPublic:true,status:'Completed'}, // assuming 'userId' in Product is foreign key to User
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
      images: product.Images.map(img => `${process.env.SERVER_URL}/${img.path.replace(/^\/+/, '')}`),
      description: product.designtitle,
      timestamp: product.createdAt,
      //skills: product.Skills.map(skill => skill.skill),
      likes: product.Likes.length,
      caption: product.Caption || '',
      hasliked:product.Likes.some(like => like.user_id === user_id),
      category: product.category || 'General', // if category is in Product
    comments: product.Comments.map(comment => ({
  id: comment.id,
  text: comment.comment,
  timestamp: comment.createdAt,
  user: comment.User ? {
    id: comment.User.user_id,
    
    name: comment.User.firstname + ' ' + comment.User.lastname,
    avatar: `${process.env.SERVER_URL}/${comment.User.profileimage.replace(/^\/+/, '')}`,
  } : {
  id: null,
  name: 'Unknown User',
  avatar: 'https://example.com/default-avatar.png'
}// or provide a fallback user
}))

    }));

    //console.log('Works data prepared:', JSON.stringify(works, null, 2));

    return res.status(200).json({ works,hasFollowedThisDesigner,loggedInUserId:user_id });

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
  const followeduser = await User.findByPk(followingId);
  if(!followeduser){
    return res.status(404).json({ error: 'Designer not found' });
  }
  const expoToken= followeduser.expoPushToken;

  const follower = await User.findByPk(followerId);
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
      const designer=followerId;
      //console.log('the designer id is ',designer);

       if (expoToken) {
          const pushMessage = {
            to: expoToken,
            sound: "default",
            title: "New Follower",
            body: `${follower.firstname} ${follower.lastname} has started following you.`,
            data: {
              params:{designer:designer},
              screen: "FeedProfileScreen",
            },
          };
      
          try {
            await axios.post("https://exp.host/--/api/v2/push/send", pushMessage, {
              headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
            });
          } catch (err) {
            console.error(
              "Push Notification Error (expired request):",
              err.response?.data || err.message
            );
          }
        }

      return res.json({ isFollowing,message: 'Followed designer' });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


//get designer information by Id(name,work,education etc)


// GET /api/designers/:id
exports.getDesignerById = async (req, res) => {
  //console.log("request received")
  try {
    const { id } = req.params;
    

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: 'Designer ID is required' });
    }

    // Fetch designer
    const designer = await User.findByPk(id, {
      attributes: [
        'user_id',
        'firstname',
        'lastname',
        'bio',
        'education',
        'location',
        'phonenumber',
        'professionalsummary',
        'work',
        'profileimage',
      ],
    });

    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    // Build full response
    const formattedDesigner = {
      id: designer.user_id,
      name: `${designer.firstname} ${designer.lastname}`,
      bio: designer.bio || '',
      education: designer.education || '',
      location: designer.location || 'Not Specified',
      phone: designer.phonenumber || '',
      professionalsummary: designer.professionalsummary || '',
      work: designer.work || '',
      avatar: `${process.env.SERVER_URL}/${designer.profileimage}`,
    };

    return res.json(formattedDesigner);
  } catch (error) {
    console.error('Error fetching designer:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// GET /api/search/designers?q=query
exports.searchDesigners = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Fetch designers whose firstname, lastname, or bio match the query
    const designers = await User.findAll({
      where: {
        [Op.or]: [
          { firstname: { [Op.like]: `%${q}%` } },
          { lastname: { [Op.like]: `%${q}%` } },
          { bio: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: [
        'user_id',
        'firstname',
        'lastname',
        'bio',
        'phonenumber',
        'profileimage',
      ],
      limit: 20,
    });

    // Map results to the format your frontend expects
    const formatted = designers.map((d) => ({
      id: d.user_id,
      name: `${d.firstname} ${d.lastname}`.trim(),
      bio: d.bio || '',
      phone: d.phonenumber || '',
      profileImage: d.profileimage
        ? `${process.env.SERVER_URL}/${d.profileimage}`
        : null,
      avatar: d.profileimage
        ? `${process.env.SERVER_URL}/${d.profileimage}`
        : 'https://example.com/default-avatar.png',
    }));

    return res.json({ designers: formatted });
  } catch (error) {
    console.error('Error searching designers:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Check if the profile belongs to the logged-in user
// @route   GET /api/profile/check-ownership/:profileId
// @access  Private
exports.checkProfileOwnership = async (req, res) => {
  try {
    const { user_id } = req.params;
    //let isOwner=false;


    // req.user comes from your auth middleware (decoded JWT)
    const loggedInUserId = req.user.id;
//console.log("From Params",user_id);
//console.log("From JWT",loggedInUserId);
    // Optional: verify the profile actually exists
    const profile = await User.findByPk(user_id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // if(user_id==loggedInUserId){
    //   isOwner=true;
    // }

    // Compare IDs
    const isOwner = String(user_id) === String(loggedInUserId);
   // console.log("Is owner",isOwner);

    return res.json({ isOwner });
  } catch (error) {
    console.error('Error checking ownership:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.DeletePost=async (req,res)=>{
  const {postid}=req.params;
  try{
  const product= await Product.findByPk(postid);
  if(!product){
    return res.status(404).json({message:'Post Not Found'});
  }

  await product.destroy();
  return res.status(200).json({message:'Post deleted successffully'});
  }
  catch(error){
    console.log('error deleting post',error)
    return res.status(500).json({message:'Failed To delete post'})

  }
}