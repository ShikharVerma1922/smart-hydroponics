import {prisma} from '../src/config/prisma.js';

async function main() {
  console.log('Seeding crop recipes and edge device...');

  // 1. Create or upsert recipes (no isActive field)
  const lettuce = await prisma.cropRecipe.upsert({
    where: { cropName: 'Butterhead Lettuce' },
    update: {},
    create: {
      cropName: 'Butterhead Lettuce',
      targetPhMin: 5.8,
      targetPhMax: 6.5,
      targetEcMin: 1.2,
      targetEcMax: 1.8,
      ecCeiling: 2.4,
      minWaterLevel: 15.0,
    },
  });

  await prisma.cropRecipe.upsert({
    where: { cropName: 'Spinach' },
    update: {},
    create: {
      cropName: 'Spinach',
      targetPhMin: 6.0,
      targetPhMax: 6.8,
      targetEcMin: 1.4,
      targetEcMax: 2.0,
      ecCeiling: 2.5,
      minWaterLevel: 15.0,
    },
  });

  // 2. Link the active recipe to the specific hardware node
  const device = await prisma.device.upsert({
    where: { id: 'esp32_node_01' },
    update: {
      activeRecipeId: lettuce.id,
    },
    create: {
      id: 'esp32_node_01',
      name: 'Hydroponics Bench 01',
      location: 'Reservoir A',
      isOnline: true,
      activeRecipeId: lettuce.id,
    },
  });

  console.log(`Seeding complete: [${device.id}] set to active crop [${lettuce.cropName}].`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });