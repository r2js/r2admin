const switchery = (selector) => {
  const elems = Array.prototype.slice.call(document.querySelectorAll(selector));

  elems.forEach((html) => {
    new window.Switchery(html, { size: 'small' });
  });
};

export default () => {
  switchery('.f-boolean');
};
