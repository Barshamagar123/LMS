import prisma from './src/config/prisma.js';

async function checkData() {
  try {
    console.log('Checking users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    users.forEach(user => console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`));

    console.log('\nChecking enrollments...');
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      }
    });
    console.log(`Found ${enrollments.length} enrollments`);
    enrollments.forEach(enrollment => console.log(`- ID: ${enrollment.id}, User: ${enrollment.user?.name}, Course: ${enrollment.course?.title}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
