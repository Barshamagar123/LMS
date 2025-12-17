import prisma from "./src/config/prisma.js";
import fs from "fs";
import path from "path";

const updateCoursesWithDefaults = async () => {
  try {
    console.log("Updating courses with default instructor and category...");

    // Get or create default instructor
    let defaultInstructor = await prisma.user.findFirst({
      where: { role: "INSTRUCTOR" }
    });

    if (!defaultInstructor) {
      defaultInstructor = await prisma.user.create({
        data: {
          name: "Default Instructor",
          email: "instructor@example.com",
          password: "$2b$10$dummy.hash.for.default", // dummy hash
          role: "INSTRUCTOR",
          isApproved: true
        }
      });
    }

    // Get or create default category
    let defaultCategory = await prisma.category.findFirst();

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          name: "General"
        }
      });
    }

    // Update all courses that don't have instructorId or categoryId
    const coursesToUpdate = await prisma.course.findMany({
      where: {
        OR: [
          { instructorId: null },
          { categoryId: null }
        ]
      }
    });

    let updateCount = 0;
    for (const course of coursesToUpdate) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          instructorId: course.instructorId || defaultInstructor.id,
          categoryId: course.categoryId || defaultCategory.id
        }
      });
      updateCount++;
    }

    console.log(`Updated ${updateCount} courses with defaults`);
  } catch (error) {
    console.error("Error updating courses:", error);
  }
};

const createSampleModulesAndLessons = async () => {
  try {
    console.log("Starting to create sample modules and lessons...");

    // Get all published courses
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" }
    });

    console.log(`Found ${courses.length} published courses`);

    // Get video files from uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    const videoFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.mp4'))
      .map(file => file);

    console.log(`Found ${videoFiles.length} video files:`, videoFiles);

    let videoIndex = 0;

    for (const course of courses) {
      console.log(`Processing course: ${course.title} (ID: ${course.id})`);

      // Create a module for this course
      const module = await prisma.module.create({
        data: {
          title: `Module 1: Introduction`,
          order: 1,
          courseId: course.id
        }
      });

      console.log(`Created module: ${module.title} (ID: ${module.id})`);

      // Create lessons using video files
      const lessonsToCreate = Math.min(3, videoFiles.length - videoIndex); // Max 3 lessons per module

      for (let i = 0; i < lessonsToCreate; i++) {
        if (videoIndex >= videoFiles.length) break;

        const videoFile = videoFiles[videoIndex];
        const lesson = await prisma.lesson.create({
          data: {
            title: `Lesson ${i + 1}: ${videoFile.replace('.mp4', '').replace(/^\d+-/, '')}`,
            contentUrl: `/uploads/${videoFile}`,
            contentType: "VIDEO",
            order: i + 1,
            moduleId: module.id
          }
        });

        console.log(`Created lesson: ${lesson.title} (ID: ${lesson.id})`);
        videoIndex++;
      }
    }

    console.log("Sample data creation completed!");
  } catch (error) {
    console.error("Error creating sample data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the script
const runSetup = async () => {
  await updateCoursesWithDefaults();
  await createSampleModulesAndLessons();
};

runSetup();
