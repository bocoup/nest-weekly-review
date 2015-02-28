'use strict';

function getSelectedOption(el) {
  var selectedIndex;

  return el.getProperty('selectedIndex').then(function(_selectedIndex) {
      selectedIndex = _selectedIndex;

      return el.findAllByTagName('option');
    }).then(function(options) {
      var selected = options[selectedIndex];

      if (!selected) {
        throw new Error(
          'Cannot read a `select` element that has no value selected.'
        );
      }

      return selected;
    });
}

/**
 * Read the visible text of a given Leadfoot/Element instance. If the element
 * is a `select` input, read the text of the selected option.
 *
 * @param {Element} el The Leadfoot/Element instance to read
 *
 * @returns {string} The visible text
 */
module.exports = function(el) {
  return el.getTagName().then(function(tagName) {
      if (tagName.toLowerCase() === 'select') {
        return getSelectedOption(el);
      }

      return el;
    }).then(function(el) {
      return el.getVisibleText();
    });
};
