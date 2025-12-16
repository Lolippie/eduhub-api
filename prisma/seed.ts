import { PrismaClient, Role } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  {
    email: 'jean@example.com',
    password: 'password',
    firstName: 'Jean',
    lastName: 'Bon',
    role: Role.ADMIN,
  },
];

async function main() {
  const usersWithPassword = await Promise.all(
    users.map(async (user) => {
      return {
        ...user,
        password: await bcrypt.hash(user.password, 10),
      };
    }),
  );

  await prisma.user.createMany({
    data: usersWithPassword,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    console.log('✅ Seed completed');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });