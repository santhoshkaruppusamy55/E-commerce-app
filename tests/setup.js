const { sequelize } = require("../models");

beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});

afterEach(async () => {
  await sequelize.truncate({ cascade: true });
});
