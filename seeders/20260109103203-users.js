"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash("user123", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          name: "User1",
          email: "user1@gmail.com",
          password: hashedPassword,
          is_admin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "User",
          email: "user2@gmail.com",
          password: hashedPassword,
          is_admin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: ["user1@gmail.com", "user2@gmail.com"]
    });
  }
};
