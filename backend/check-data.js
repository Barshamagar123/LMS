import prisma from "./src/config/prisma.js";

const checkData = async () => {
  try {
    console.log("Checking database data...");

    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`Course: ${course.title} (ID: ${course.id})`);
      console.log(`  Modules: ${course.modules.length}`);
      course.modules.forEach(module => {
        console.log(`    Module: ${module.title} (ID: ${module.id})`);
        console.log(`    Lessons: ${module.lessons.length}`);
        module.lessons.forEach(lesson => {
          console.log(`      Lesson: ${lesson.title} (ID: ${lesson.id}) - Type: ${lesson.contentType} - URL: ${lesson.contentUrl}`);
        });
      });
      console.log('---');
    });

  } catch (error) {
    console.error("Error checking data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the script
checkData();
