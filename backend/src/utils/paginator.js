// src/utils/paginator.js
export const paginate = (page = 1, per_page = 10) => {
  const take = per_page;
  const skip = (page - 1) * per_page;
  return { take, skip };
};
