let navigator = null;

export const setNavigator = (navFn) => {
  navigator = navFn;
};

export const navigateTo = async (path, options = {}) => {
  if (navigator) {
    await navigator(path, options); // options = { replace: true }, etc.
  } else {
    console.warn("Navigator not set yet.");
  }
};