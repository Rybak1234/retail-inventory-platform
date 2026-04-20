const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cols = await p.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`
  );
  console.log('Columns in User table:', cols.map(c => c.column_name).join(', '));
  
  // Also check if avatar specifically exists
  const hasAvatar = cols.some(c => c.column_name === 'avatar');
  console.log('Has avatar column:', hasAvatar);
  
  await p.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
