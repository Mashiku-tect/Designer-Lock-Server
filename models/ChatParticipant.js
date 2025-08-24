// models/ChatParticipant.js
module.exports = (sequelize, DataTypes) => {
  const ChatParticipant = sequelize.define("ChatParticipant", {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: "chat_participants",
    timestamps: false
  });

  return ChatParticipant;
};
