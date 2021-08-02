process.env.NODE_ENV = "test";

module.exports = {
  extension: ["ts"],
  recursive: "test",
  require: ["hardhat/register"],
};
