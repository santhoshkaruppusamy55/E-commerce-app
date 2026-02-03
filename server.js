const app = require("./src/app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "development") {
  sequelize.sync({ alter: true })
    .then(() => console.log("DB Synced (dev)"))
    .catch(err => console.log("sync err:", err));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
