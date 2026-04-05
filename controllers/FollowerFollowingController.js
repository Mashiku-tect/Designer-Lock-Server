const { User, Follow } = require('../models');
const { Op } = require('sequelize');

// exports.getFollowersAndFollowing = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user_id=userId;
//     //console.log('query',req.query)
//     const {limit}=req.query;
//     //console.log('limit is',limit)

//     if (!userId) {
//       return res.status(400).json({ message: 'Missing userId' });
//     }

//     //Get the designer name
//     const designer = await User.findByPk(user_id, {
//   attributes: ['firstname', 'lastname'],
// });

// if (!designer) {
//   return res.status(404).json({ message: 'Designer not found' });
// }

// const designerName = `${designer.firstname} ${designer.lastname}`;

//     // ---- 1️⃣ Fetch Followers (users who follow this user)
//     // ---- 1️⃣ Fetch Followers (users who follow me)
// const followers = await Follow.findAll({
//   where: { following_id: userId },
//   include: [
//     {
//       model: User,
//       as: 'Followers', // Must match association alias
//       attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
//     },
//   ],
// });

// // ---- 2️⃣ Fetch Following (users I follow)
// const following = await Follow.findAll({
//   where: { follower_id: userId },
//   include: [
//     {
//       model: User,
//       as: 'Followings',
//       attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
//     },
//   ],
// });

// // ---- 3️⃣ Build ID sets for cross-checking relationships
// const followerIds = new Set(followers.map(f => f.Followers?.user_id));
// const followingIds = new Set(following.map(f => f.Followings?.user_id));

// // ---- 4️⃣ Format Followers (users who follow me)
// const formattedFollowers = followers.map(f => ({
//   id: f.Followers.user_id,
//   name: `${f.Followers.firstname} ${f.Followers.lastname}`,
//   bio: f.Followers.bio,
//   avatar: `${process.env.SERVER_URL}/${f.Followers.profileimage}`,
//   isFollowing: followingIds.has(f.Followers.user_id), // ✅ do I follow them back?
// }));

// // ---- 5️⃣ Format Following (users I follow)
// const formattedFollowing = following.map(f => ({
//   id: f.Followings.user_id,
//   name: `${f.Followings.firstname} ${f.Followings.lastname}`,
//   bio: f.Followings.bio,
//   avatar: `${process.env.SERVER_URL}/${f.Followings.profileimage}`,
//   isFollowing: true, // ✅ I follow them
//   followedBack: followerIds.has(f.Followings.user_id), // ✅ do they follow me back?
// }));


//     // ---- 6️⃣ Return both lists
//     return res.json({
//       followers: formattedFollowers,
//       following: formattedFollowing,
//       designername:designerName
//     });

//   } catch (error) {
//     console.error('Error fetching followers/following:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };


//get followers and following using ID when another user wants to know the followers/users who another user has followed



exports.getFollowersAndFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, cursor } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    const user_id = userId;

    // Get designer name
    const designer = await User.findByPk(user_id, {
      attributes: ['firstname', 'lastname'],
    });

    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    const designername = `${designer.firstname} ${designer.lastname}`;

    // 👇 Build where clause for cursor pagination
    const followerWhere = {
      following_id: userId,
      ...(cursor && {
        createdAt: { [Op.lt]: new Date(cursor) },
      }),
    };

    // ---- 1️⃣ Fetch Followers using cursor
    const followersResult = await Follow.findAll({
      where: followerWhere,
      limit: parseInt(limit) + 1,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
        },
      ],
    });

    const hasMoreFollowers = followersResult.length > limit;
    const actualFollowers = hasMoreFollowers
      ? followersResult.slice(0, limit)
      : followersResult;

    // Next cursor for followers
    const nextFollowerCursor = hasMoreFollowers
      ? actualFollowers[actualFollowers.length - 1].createdAt
      : null;

    // ---- 2️⃣ Fetch Following using cursor
    // NOTE: If you want separate cursor for following,
    // you could use a separate query param like `followingCursor`.
    const followingWhere = {
      follower_id: userId,
      ...(cursor && {
        createdAt: { [Op.lt]: new Date(cursor) },
      }),
    };

    const followingResult = await Follow.findAll({
      where: followingWhere,
      limit: parseInt(limit) + 1,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Followings',
          attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
        },
      ],
    });

    const hasMoreFollowing = followingResult.length > limit;
    const actualFollowing = hasMoreFollowing
      ? followingResult.slice(0, limit)
      : followingResult;

    const nextFollowingCursor = hasMoreFollowing
      ? actualFollowing[actualFollowing.length - 1].createdAt
      : null;

    // ---- 3️⃣ Format Followers
    const followerIds = new Set(actualFollowers.map(f => f.Followers?.user_id));
    const followingIds = new Set(actualFollowing.map(f => f.Followings?.user_id));

    const formattedFollowers = actualFollowers.map(f => ({
      id: f.Followers.user_id,
      name: `${f.Followers.firstname} ${f.Followers.lastname}`,
      bio: f.Followers.bio,
      avatar: `${process.env.SERVER_URL}/${f.Followers.profileimage}`,
      isFollowing: followingIds.has(f.Followers.user_id),
    }));

    // ---- 4️⃣ Format Following
    const formattedFollowing = actualFollowing.map(f => ({
      id: f.Followings.user_id,
      name: `${f.Followings.firstname} ${f.Followings.lastname}`,
      bio: f.Followings.bio,
      avatar: `${process.env.SERVER_URL}/${f.Followings.profileimage}`,
      isFollowing: true,
      followedBack: followerIds.has(f.Followings.user_id),
    }));

    return res.json({
      designername,
      followers: formattedFollowers,
      following: formattedFollowing,
      pagination: {
        followers: {
          nextCursor: nextFollowerCursor,
          hasMore: hasMoreFollowers,
        },
        following: {
          nextCursor: nextFollowingCursor,
          hasMore: hasMoreFollowing,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching followers/following:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.getUserFollows = async (req, res) => {
  try {
    const { userId, type } = req.params; // type = 'followers' or 'following'
    const loggedInUserId = req.user.id; // from verifyToken middleware

    let follows;

    if (type === "followers") {
      // Users who follow this designer
      follows = await Follow.findAll({
        where: { following_id: userId },
        include: [
          {
            model: User,
            as: "Followers",
            attributes: ["user_id", "firstname", "lastname",  "profileimage"],
          },
        ],
      });

      // Map data to clean JSON
      const followersList = await Promise.all(
        follows.map(async (f) => {
          const follower = f.Followers;
         const isFollowing = await Follow.findOne({
  where: { follower_id: loggedInUserId, following_id: follower.user_id },
});


          //console.log("IS following a follower ?",!!isFollowing);

          return {
            id: follower.user_id,
            name: `${follower.firstname} ${follower.lastname}`,
            bio: follower.bio,
            username: "No Username",
            avatar: `${process.env.SERVER_URL}/${follower.profileimage}`,
            isFollowing: !!isFollowing,
         
          };
        })
      );

      return res.json({ type: "followers", data: followersList,   loggedInUserId });
    }

    if (type === "following") {
      // Users this designer follows
      follows = await Follow.findAll({
        where: { follower_id: userId },
        include: [
          {
            model: User,
            as: "Followings",
            attributes: ["user_id", "firstname", "lastname", "profileimage"],
          },
        ],
      });
     //console.log("Follows", follows.map(f => f.toJSON()));


      const followingList = await Promise.all(
        follows.map(async (f) => {
          const following = f.Followings;
          const isFollowing = await Follow.findOne({
  where: { follower_id: loggedInUserId, following_id: following.user_id },
});

     //console.log("Is following number two",!!isFollowing);
          return {
            id: following.user_id,
            name: `${following.firstname} ${following.lastname}`,
            bio: following.bio,
            username: "No username",
            avatar: `${process.env.SERVER_URL}/${following.profileimage}`,
            isFollowing: !!isFollowing,
         
          };
        })
      );

      return res.json({ type: "following", data: followingList,   loggedInUserId });
    }

    res.status(400).json({ message: "Invalid follow type" });
  } catch (error) {
    console.error("Error fetching follows:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//get followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, cursor } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    // Get designer name
    const designer = await User.findByPk(userId, {
      attributes: ['firstname', 'lastname'],
    });

    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    const designername = `${designer.firstname} ${designer.lastname}`;

    // Cursor pagination
    const whereClause = {
      following_id: userId,
      ...(cursor && { createdAt: { [Op.lt]: new Date(cursor) } }),
    };

    const followersResult = await Follow.findAll({
      where: whereClause,
      limit: parseInt(limit) + 1,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
        },
      ],
    });

    const hasMore = followersResult.length > limit;
    const followers = hasMore
      ? followersResult.slice(0, limit)
      : followersResult;

    const nextCursor = hasMore
      ? followers[followers.length - 1].createdAt
      : null;

    // Get who the designer is following (for isFollowing flag)
    const following = await Follow.findAll({
      where: { follower_id: userId },
      attributes: ['following_id'],
    });

    const followingIds = new Set(following.map(f => f.following_id));

    const formattedFollowers = followers.map(f => ({
      id: f.Followers.user_id,
      name: `${f.Followers.firstname} ${f.Followers.lastname}`,
      bio: f.Followers.bio,
      avatar: `${process.env.SERVER_URL}/${f.Followers.profileimage}`,
      isFollowing: followingIds.has(f.Followers.user_id),
    }));

    return res.json({
      designername,
      followers: formattedFollowers,
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



//get users the designer is following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, cursor } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    // Get designer name
    const designer = await User.findByPk(userId, {
      attributes: ['firstname', 'lastname'],
    });

    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    const designername = `${designer.firstname} ${designer.lastname}`;

    // Cursor pagination
    const whereClause = {
      follower_id: userId,
      ...(cursor && { createdAt: { [Op.lt]: new Date(cursor) } }),
    };

    const followingResult = await Follow.findAll({
      where: whereClause,
      limit: parseInt(limit) + 1,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Followings',
          attributes: ['user_id', 'firstname', 'lastname', 'bio', 'profileimage'],
        },
      ],
    });

    const hasMore = followingResult.length > limit;
    const following = hasMore
      ? followingResult.slice(0, limit)
      : followingResult;

    const nextCursor = hasMore
      ? following[following.length - 1].createdAt
      : null;

    // Get followers for followedBack flag
    const followers = await Follow.findAll({
      where: { following_id: userId },
      attributes: ['follower_id'],
    });

    const followerIds = new Set(followers.map(f => f.follower_id));

    const formattedFollowing = following.map(f => ({
      id: f.Followings.user_id,
      name: `${f.Followings.firstname} ${f.Followings.lastname}`,
      bio: f.Followings.bio,
      avatar: `${process.env.SERVER_URL}/${f.Followings.profileimage}`,
      isFollowing: true,
      followedBack: followerIds.has(f.Followings.user_id),
    }));

    return res.json({
      designername,
      following: formattedFollowing,
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
