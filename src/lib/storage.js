const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const get = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : value;
};

const del = (key) => {
  localStorage.removeItem(key);
};

const clear = () => {
  localStorage.clear();
};

export default { set, get, del, clear };
