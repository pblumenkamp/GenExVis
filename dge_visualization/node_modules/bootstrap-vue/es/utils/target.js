import { keys } from '../utils/object';

var allListenTypes = { hover: true, click: true, focus: true };

export default function targets(vnode, binding, listenTypes, fn) {
  var targets = keys(binding.modifiers || {}).filter(function (t) {
    return !allListenTypes[t];
  });

  if (binding.value) {
    targets.push(binding.value);
  }

  var listener = function listener() {
    fn({ targets: targets, vnode: vnode });
  };

  keys(allListenTypes).forEach(function (type) {
    if (listenTypes[type] || binding.modifiers[type]) {
      vnode.elm.addEventListener(type, listener);
    }
  });

  // Return the list of targets
  return targets;
}