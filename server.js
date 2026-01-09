const app = require("./src/app");
const { sequelize } = require("./src/models");

if (process.env.NODE_ENV !== "test") {
  sequelize.sync({ alter: true })
    .then(() => console.log("DB Synced"))
    .catch(err => console.log("sync err:", err));
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
