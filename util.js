function buildElements(options) {
  return Object.entries(options)
    .reduce(function (map, [key, value]) {
      map[key] = parseElementOption(value);
      return map;
    }, {});
}

function parseElementOption(option) {
  if (typeof option === 'string') {
    return document.getElementById(option);
  } else if (option.type === 'slider') {
    const slider = document.getElementById(option.base + '-slider');
    const value = function () {
      return option.values[parseInt(slider.value, 10)];
    };
    return {
      slider,
      value
    };
  } else if (option.type === 'color') {
    const picker = document.getElementById(option.id);
    const value = function () {
      return {
        hex: picker.value,
        rgb: hexToRgb(picker.value)
      };
    };
    return {
      picker,
      value
    };
  }
}

function on(event, callback, element) {
  (element || document.body).addEventListener(event, callback);
}

function hexToRgb(hex) {
  return [
    parseInt(hex.substring(1, 3), 16),
    parseInt(hex.substring(3, 5), 16),
    parseInt(hex.substring(5, 7), 16)
  ];
}

function setColor(name, color, element) {
  (element || document.body).style.setProperty('--c-' + name, color);
}
