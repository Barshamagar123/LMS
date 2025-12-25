import prisma from './src/config/prisma.js';

async function checkLessonProgress() {
  try {
    console.log('Checking lesson progress for enrollment ID 5...');
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { enrollmentId: 5 },
      include: {
        lesson: { select: { title: true, id: true } }
      }
    });

    console.log(`Found ${lessonProgress.length} lesson progress records`);
    lessonProgress.forEach(lp => console.log(`- Lesson: ${lp.lesson?.title} (ID: ${lp.lessonId}), Completed: ${lp.completed}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessonProgress();
