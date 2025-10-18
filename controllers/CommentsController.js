const { Comments, User, Product } = require('../models');

exports.addCommentToProduct = async (req, res) => {
  const user_id = req.user.id; // from your auth middleware
  const { productId } = req.params;
  const { text } = req.body;
  const product_id=productId;
  //console.log('Received comment:', { user_id, product_id, text });

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    // Optional: check product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create comment
    const comment = await Comments.create({
      user_id,
      product_id,
      comment: text  // or your field name, maybe `text`
    });

    // Fetch the newly created comment with user info
    const commentWithUser = await Comments.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ['user_id', 'firstname', 'lastname', 'profileimage']
        }
      ]
    });

    return res.status(201).json({
      comment: {
        id: commentWithUser.id,
        text: commentWithUser.comment,  // or text field name
        timestamp: commentWithUser.createdAt,
        user: {
          id: commentWithUser.User.user_id,
          name: `${commentWithUser.User.firstname} ${commentWithUser.User.lastname}`,
          avatar: commentWithUser.User.profileimage
        }
      }
    });
  } catch (err) {
    console.error('Error in addCommentToProduct:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
