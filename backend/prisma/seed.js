import {prisma} from '../src/config/prisma.js';

async function main() {
  console.log('Seeding baseline crop recipe...');

  // Reset existing recipes to prevent duplicates during testing
  await prisma.cropRecipe.deleteMany({});

  const lettuceRecipe = await prisma.cropRecipe.create({
    data: {
      cropName: 'Butterhead Lettuce',
      targetPhMin: 5.8,
      targetPhMax: 6.5,
      targetEcMin: 1.2,        // mS/cm
      targetEcMax: 1.8,        // mS/cm
      ecCeiling: 2.4,          // Upper safety limit for osmotic shock
      minWaterLevel: 15.0,     // Percentage threshold
      isActive: true,
    },
  });

  console.log(`Default active recipe created: ${lettuceRecipe.cropName}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });