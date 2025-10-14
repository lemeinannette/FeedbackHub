import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  paginate, 
  indexOfFirstItem, 
  indexOfLastItem, 
  filteredFeedbacks 
}) => {
  if (totalPages <= 1) return null;

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const paginationNumbers = getPaginationNumbers();

  return (
    <section className="pagination-section">
      <div className="pagination-container">
        <div className="pagination-info">
          <span className="info-text">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFeedbacks.length)} of {filteredFeedbacks.length} entries
          </span>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        <div className="pagination-controls">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
            aria-label="Previous page"
          >
            <i className="bx bx-chevron-left"></i>
            <span>Previous</span>
          </button>
          
          <div className="pagination-numbers">
            {paginationNumbers.map((number, index) => (
              <React.Fragment key={index}>
                {number === '...' ? (
                  <span className="pagination-dots">...</span>
                ) : (
                  <button
                    onClick={() => paginate(number)}
                    className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                    aria-label={`Go to page ${number}`}
                    aria-current={currentPage === number ? 'page' : undefined}
                  >
                    {number}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
            aria-label="Next page"
          >
            <span>Next</span>
            <i className="bx bx-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pagination;