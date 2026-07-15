window.CONFIG_PRICES = {
  // Базовая цена гаража и доплата за каждый метр длины после базовой
  GARAGE: {
    single: {
      baseLength: 6,
      basePrice: 1200000,
      extraMeterPrice: 100000
    },
    double: {
      baseLength: 6,
      basePrice: 1700000,
      extraMeterPrice: 100000
    }
  },

  // Доплаты за планировку
  LAYOUT_SURCHARGE: {
    classic: 0,
    storage: 100000,
    utility: 100000
  },

  // Доплаты за тип крыши
  ROOF_SURCHARGE: {
    flat: 0,
    gable: 130000,
    shed: 85000
  },

  // Цены дополнительных элементов
  ELEMENT_PRICE: {
    shelves: 100000,
    partition: 100000,
    door: 35000,
    window: 15000
  },

  // Ставка за квадратный метр по фундаменту
  FOUNDATION_RATE_PER_M2: {
    none: 0,
    pile: 1500,
    strip: 2500,
    slab: 3500
  },

  // Цены дополнительных опций
  OPTIONS_PRICE: {
    gateAutomation: 25000,
    interiorElectricity: 50000,
    exteriorLighting: 15000,
    ventilation: 6000,
    gutters: 25000
  }
};