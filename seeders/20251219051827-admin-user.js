"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("admin1234", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        is_admin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: "admin@gmail.com"
    });
  }
};
