import prisma from "./src/config/prisma.js";

const addLessonsToCourse5 = async () => {
  try {
    console.log("Adding lessons to course 5...");

    // Get course 5 to see its modules
    const course = await prisma.course.findUnique({
      where: { id: 5 },
      include: { modules: true }
    });

    if (!course) {
      console.log("Course 5 not found");
      return;
    }

    console.log(`Course: ${course.title}`);
    console.log(`Modules: ${course.modules.length}`);

    // Use the first module (Introduction, ID: 9)
    const moduleId = 9;

    // Add some lessons to this module
    const lessons = [
      {
        title: "Java Introduction",
        contentType: "VIDEO",
        contentUrl: "/uploads/course-videos/video-1766329843618-797911148.mp4",
        order: 1
      },
      {
        title: "Java Basics",
        contentType: "VIDEO",
        contentUrl: "/uploads/course-videos/video-1766329977668-580099263.mp4",
        order: 2
      },
      {
        title: "Java Advanced Concepts",
        contentType: "VIDEO",
        contentUrl: "/uploads/course-videos/video-1766330274124-823221949.mp4",
        order: 3
      }
    ];

    for (const lesson of lessons) {
      const createdLesson = await prisma.lesson.create({
        data: {
          ...lesson,
          moduleId: moduleId
        }
      });
      console.log(`Created lesson: ${createdLesson.title} (ID: ${createdLesson.id})`);
    }

    console.log("Lessons added successfully!");

  } catch (error) {
    console.error("Error adding lessons:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the script
addLessonsToCourse5();
