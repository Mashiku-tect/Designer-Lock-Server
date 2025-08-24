// models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM("text", "image", "video", "audio"),
      allowNull: false,
    },
    text_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    tableName: "messages",
    timestamps: true // createdAt, updatedAt
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, {
      foreignKey: "chat_id",
      as: "chat"
    });
    Message.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender"
    });
  };

  return Message;
};
