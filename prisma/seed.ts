import { rodarSeedProdutos } from "../lib/seed-produtos";
import { prisma } from "../lib/prisma";

async function main() {
  const { criadas } = await rodarSeedProdutos();
  console.log(`Seed concluído: ${criadas} oportunidades criadas para demo@importscope.app`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
