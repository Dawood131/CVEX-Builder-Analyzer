let _freshTemplate = false;

export const cvSession = {
  markFreshTemplate: () => { _freshTemplate = true; },

  isFreshTemplate: () => _freshTemplate,

  consumeFreshTemplate: () => {
    const val = _freshTemplate;
    _freshTemplate = false;
    return val;
  },
};