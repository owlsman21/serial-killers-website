// --- Global State ---
const entriesPerPage = 5; // Start with 5 large videos per page
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    // Check if the required elements exist before initializing
    if (document.getElementById('caseGrid') && typeof featuredCases !== 'undefined') {
        renderFeaturedPage();
        
        // Listen for clicks on the pagination controls
        const paginationControls = document.getElementById('pagination-controls');
        if(paginationControls) {
            paginationControls.addEventListener('click', handlePaginationClick);
        }
    }
});

/**
 * Generates the detailed HTML for a single index page video card.
 * This includes the title, description, and the iframe for the video.
 * @param {object} caseData - The case object from the featuredCases array.
 * @returns {string} The HTML string for the video card.
 */
function generateIndexVideoHTML(caseData) {
    // Uses the embedId to create a responsive YouTube iframe
    return `
        <a href="#" class="index-video-card-link">
            <div class="index-card">
            
                <div class="video-wrapper">
                    <iframe 
                        src="https://www.youtube.com/embed/${caseData.embedId}?autoplay=0&controls=1&modestbranding=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        class="embedded-video-player">
                    </iframe>
                </div>
                
                <h3 class="index-card-title">${caseData.title}</h3>
                <p class="index-card-description">${caseData.description}</p>
                <a href="#" class="full-story-button">CLICK HERE FOR THE FULL STORY</a>
                
            </div>
        </a>
    `;
}

/**
 * Renders the current page of featured cases to the DOM.
 */
function renderFeaturedPage() {
    const totalCases = featuredCases.length;
    const caseGrid = document.getElementById('caseGrid');
    
    // Calculate pagination boundaries
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const casesToRender = featuredCases.slice(startIndex, endIndex);

    caseGrid.innerHTML = ''; // Clear previous content

    // Generate HTML for all cases on the current page
    casesToRender.forEach(caseData => {
        caseGrid.innerHTML += generateIndexVideoHTML(caseData);
    });

    renderPaginationControls(totalCases);
}

/**
 * Handles clicks on the pagination buttons.
 * @param {Event} event - The click event.
 */
function handlePaginationClick(event) {
    const button = event.target.closest('button.pagination-button');
    if (button) {
        const page = parseInt(button.dataset.page);
        if (page !== currentPage) {
            currentPage = page;
            renderFeaturedPage();
             // Optional: Scroll to the top of the grid after changing pages
             document.getElementById('caseGrid').scrollIntoView({ behavior: 'smooth' });
        }
    }
}

/**
 * Generates and displays the pagination controls.
 * @param {number} totalResults - The total number of results found.
 */
function renderPaginationControls(totalResults) {
    const controlsContainer = document.getElementById('pagination-controls');
    if (!controlsContainer) return;

    const totalPages = Math.ceil(totalResults / entriesPerPage);
    controlsContainer.innerHTML = ''; 
    
    if (totalResults > entriesPerPage) {
        
        // Use a wrapper for centering and spacing
        const wrapDiv = document.createElement('div');
        wrapDiv.style.display = 'flex';
        wrapDiv.style.justifyContent = 'center';
        wrapDiv.style.marginTop = '20px'; 
        wrapDiv.style.marginBottom = '40px'; 
        wrapDiv.style.gap = '8px'; // Add a small gap between buttons
        
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.dataset.page = i; // Store the page number
            button.className = 'pagination-button bg-red-800 text-white hover:bg-red-600 rounded-lg px-4 py-2 transition-colors duration-200';
            
            if (i === currentPage) {
                button.classList.add('bg-red-600', 'font-bold');
            }
            
            wrapDiv.appendChild(button);
        }
        
        controlsContainer.appendChild(wrapDiv);
    } 
}