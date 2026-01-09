const ejs = require("ejs");
const path = require("path");

module.exports = async (templateName, data) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "emails",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};
