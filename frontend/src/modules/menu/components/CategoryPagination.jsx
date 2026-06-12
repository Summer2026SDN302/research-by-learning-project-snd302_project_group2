import PaginationControl from "@/components/navigation/PaginationControl";

const CategoryPagination = ({ pagination, onPageChange }) => {
  const { page, limit, total, totalPages } = pagination;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3 text-body-sm">
      <span className="text-on-surface-variant">
        Hiển thị {from}-{to} trên {total} danh mục
      </span>
      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default CategoryPagination;
