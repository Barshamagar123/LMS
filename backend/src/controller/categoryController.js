import prisma from "../config/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Check if category with the same name already exists
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await prisma.category.create({ data: { name } });
  res.status(201).json({ message: "Category created", category });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Optional: Check if another category already has the new name
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing && existing.id !== Number(id)) {
    return res.status(400).json({ message: "Another category with this name already exists" });
  }

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name },
  });
  res.json({ message: "Category updated", category });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: Number(id) } });
  res.json({ message: "Category deleted" });
});

export const list = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});
// Add this to your categoryController.js
export const getCategoryStats = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          courses: {
            where: { status: "PUBLISHED" }
          }
        }
      }
    }
  });

  // Calculate student counts per category
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const studentCount = await prisma.enrollment.count({
        where: {
          course: {
            categoryId: category.id,
            status: "PUBLISHED"
          }
        }
      });

      return {
        ...category,
        courseCount: category._count.courses,
        studentCount
      };
    })
  );

  const totalCourses = categoriesWithStats.reduce((sum, cat) => sum + cat.courseCount, 0);
  const totalStudents = categoriesWithStats.reduce((sum, cat) => sum + cat.studentCount, 0);

  res.json({
    categories: categoriesWithStats,
    stats: { totalCourses, totalStudents }
  });
});