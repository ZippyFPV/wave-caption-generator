
export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const isDistributionBalanced = (distribution, numCategories = 40) => {
  if (!distribution || typeof distribution.byContext !== 'object' || distribution.total < numCategories) {
    return true; // Not enough data to be imbalanced
  }
  const counts = Object.values(distribution.byContext);
  if (counts.length === 0) return true;
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  return (max - min) <= Math.ceil(distribution.total / numCategories);
};

export const groupErrorsByType = (errors) => {
  const groups = {};
  errors.forEach(error => {
    const type = error.action || 'General';
    if (!groups[type]) {
      groups[type] = 0;
    }
    groups[type]++;
  });
  return groups;
};

export const getOptimalVariantsForManual = () => {
  const basePrice = 19.99;
  const optimalSizes = [
    { id: 33742, size: "14″ x 11″", priceMultiplier: 1.0 },
    { id: 33749, size: "11″ x 14″", priceMultiplier: 1.0 },
    { id: 113155, size: "14″ x 14″", priceMultiplier: 1.1 },
    { id: 33744, size: "20″ x 16″", priceMultiplier: 1.4 },
    { id: 33751, size: "16″ x 20″", priceMultiplier: 1.4 },
    { id: 33750, size: "12″ x 18″", priceMultiplier: 1.2 },
    { id: 33745, size: "24″ x 18″", priceMultiplier: 1.8 },
    { id: 33752, size: "18″ x 24″", priceMultiplier: 1.8 }
  ];

  return optimalSizes.map(variant => ({
    id: variant.id,
    price: Math.round(basePrice * variant.priceMultiplier * 100),
    is_enabled: true
  }));
};

export const calculate3DayCapacity = (avgTimePerListing, successRate) => {
  const secondsPerDay = 24 * 60 * 60;
  const totalSeconds = 3 * secondsPerDay;
  const listingsPerSecond = 1 / (avgTimePerListing / 1000);

  const theoreticalMax = Math.floor(totalSeconds * listingsPerSecond);
  
  // Realistic estimate with 85% efficiency and success rate
  const realistic = Math.floor(theoreticalMax * 0.85 * (successRate / 100));
  
  // Conservative estimate (80% of realistic)
  const conservative = Math.floor(realistic * 0.8);

  const listingsPerHour = Math.floor((avgTimePerListing > 0 ? 3600 / (avgTimePerListing / 1000) : 0) * 0.85 * (successRate / 100));
  const listingsPerDay = listingsPerHour * 24;

  return {
    realistic,
    conservative,
    theoretical: theoreticalMax,
    breakdown: {
      listingsPerHour,
      listingsPerDay,
    }
  };
};
