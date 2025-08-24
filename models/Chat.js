// models/Chat.js
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define("Chat", {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    }
  }, {
    tableName: "chats",
    timestamps: true, // adds createdAt, updatedAt
  });

  Chat.associate = (models) => {
    Chat.belongsToMany(models.User, {
      through: models.ChatParticipant,
      foreignKey: "chat_id",
      as: "participants"
    });
    Chat.hasMany(models.Message, {
      foreignKey: "chat_id",
      as: "messages"
    });
  };

  return Chat;
};
