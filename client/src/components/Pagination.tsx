interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange
}: PaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          aria-label="Previous page"
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            hasPrevious
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-300 bg-gray-100 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          aria-label="Next page"
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            hasNext
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-300 bg-gray-100 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
            {' · '}
            <span className="font-medium">{totalItems}</span> items total
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevious}
              aria-label="Previous page"
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                hasPrevious
                  ? 'text-gray-500 bg-white hover:bg-gray-50'
                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext}
              aria-label="Next page"
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                hasNext
                  ? 'text-gray-500 bg-white hover:bg-gray-50'
                  : 'text-gray-300 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
