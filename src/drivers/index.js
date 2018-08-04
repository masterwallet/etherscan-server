module.exports = (options) => {

  // HERE we can detectt another DB driver, not only mysql
  return require('./mysql-driver');

};
