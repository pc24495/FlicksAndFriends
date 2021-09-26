const arrayToAllInts = (array) => {
  const rx = new RegExp(/^\d+$/);
  return array.filter((el) => rx.test(el)).map((el) => parseInt(el));
};

module.exports = arrayToAllInts;
