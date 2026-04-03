const { Likes } = require('../models');

exports.toggleLike = async (req, res) => {
  const user_id = req.user.id;
  const { postId } = req.params;
  const product_id = postId;

  try {
    // Check if the user already liked the post
    const existingLike = await Likes.findOne({ where: { user_id, product_id } });

    let liked;

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      liked = false;
    } else {
      // Like
      await Likes.create({ user_id, product_id });
      liked = true;
    }

    // Get updated like count
    const totalLikes = await Likes.count({ where: { product_id } });

    return res.status(200).json({ liked, totalLikes });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
