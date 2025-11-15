// Global state variables
let allEntries = [];
const entriesPerPage = 6;
let currentPage = 1;
let currentSearchTerm = '';
// New variable to track the last embedded URL for re-rendering
let lastEmbeddedUrl = null; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize data on load
    initializeArchive();
    
    // 2. Set up event listener for the search bar
    const searchInput = document.getElementById('movie-search-input');
    if (searchInput) {
        // Debounce the input for performance
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // 3. Set up event listener for embedding the video
    // We listen on the container and rely on event delegation for efficiency
    const container = document.getElementById('movie-archive-container');
    if (container) {
        container.addEventListener('click', handleMovieClick);
    }
});

/**
 * Initializes the archive by collecting all movie entries.
 */
function initializeArchive() {
    const container = document.getElementById('movie-archive-container');
    if (!container) return;

    // Convert the live HTML collection of sections into a stable array
    // This is done BEFORE pagination/filtering is applied.
    allEntries = Array.from(container.querySelectorAll('.movie-entry'));
    
    // Initially render the first page of the unfiltered data
    renderArchive();
}

/**
 * Handles the click on a movie entry to embed the video.
 * @param {Event} event - The click event.
 */
function handleMovieClick(event) {
    // Traverse up from the click target to find the parent movie-entry section
    const movieEntry = event.target.closest('.movie-entry');
    
    if (movieEntry) {
        // Prevent default link behavior if the click originated from an <a> tag inside
        const clickedLink = event.target.closest('a');
        if (clickedLink) {
             event.preventDefault(); // Stop the link from navigating away
        }
        
        // Get the ok.ru URL from the new data-url attribute (must be added to HTML)
        let videoUrl = movieEntry.getAttribute('data-url');
        
        if (videoUrl) {
            // Check if the URL is an ok.ru link and modify it for embedding
            if (videoUrl.includes('ok.ru/video/')) {
                // To embed an ok.ru video, you need to replace 'video/' with 'embed/'
                // and potentially remove any trailing parameters.
                videoUrl = videoUrl.replace('/video/', '/embed/');
            }
            
            embedVideo(videoUrl);
        }
    }
}

/**
 * Loads the video URL into the dedicated video embed area.
 * @param {string} url - The modified embed URL.
 */
function embedVideo(url) {
    const embedArea = document.getElementById('video-embed-area');
    if (!embedArea) {
        console.error("Video embed area not found. Please add a div with id='video-embed-area' to your HTML.");
        return;
    }
    
    // Only update if the URL is new
    if (lastEmbeddedUrl === url) return;
    lastEmbeddedUrl = url;

    // Create the embed iframe structure
    embedArea.innerHTML = `
        <div class="video-wrapper">
            <iframe 
                src="${url}" 
                frameborder="0" 
                allow="autoplay; encrypted-media; fullscreen" 
                allowfullscreen 
                style="width:100%; height:100%; min-height: 400px; border-radius: 12px;"
            ></iframe>
        </div>
    `;

    // Scroll to the video player
    embedArea.scrollIntoView({ behavior: 'smooth' });
}


/**
 * Handles the search input event, triggering filtering.
 * @param {Event} event - The input event.
 */
function handleSearch(event) {
    currentSearchTerm = event.target.value.toLowerCase().trim();
    currentPage = 1; // Reset to first page on new search
    renderArchive();
}

/**
 * Renders the filtered and paginated movie entries to the DOM.
 */
function renderArchive() {
    const container = document.getElementById('movie-archive-container');
    if (!container) return;

    // Filter based on search term
    const filteredEntries = allEntries.filter(entry => {
        if (currentSearchTerm === '') return true;
        
        // Use the data-keywords attribute for searching
        const keywords = entry.getAttribute('data-keywords') || '';
        return keywords.toLowerCase().includes(currentSearchTerm) || 
               entry.textContent.toLowerCase().includes(currentSearchTerm);
    });

    // Calculate pagination boundaries
    const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    
    // Slice the entries for the current page
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    // Update the DOM
    container.innerHTML = '';
    
    if (paginatedEntries.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 text-lg py-12">No killers found matching your search terms. Try a different victim!</p>';
    } else {
        // Append only the entries for the current page
        paginatedEntries.forEach(entry => container.appendChild(entry));
    }

    // Always re-render pagination controls after rendering entries
    renderPaginationControls(totalPages, filteredEntries.length);
}

/**
 * Generates and displays the pagination controls (buttons).
 * @param {number} totalPages - The total number of pages.
 * @param {number} totalResults - The total number of results found.
 */
function renderPaginationControls(totalPages, totalResults) {
    const controlsContainer = document.getElementById('pagination-controls');
    if (!controlsContainer) return;

    controlsContainer.innerHTML = ''; // Clear previous controls
    
    if (totalResults > entriesPerPage) {
        
        // --- START Centering and Gap Reduction Logic ---
        
        const wrapDiv = document.createElement('div');
        // Use Flexbox to center the content
        wrapDiv.style.display = 'flex';
        wrapDiv.style.justifyContent = 'center';
        
        // ADJUSTED: Set bottom margin higher (40px) than top (20px) to visually balance the gap
        wrapDiv.style.marginTop = '20px'; 
        wrapDiv.style.marginBottom = '40px'; 
        
        // Create a div for the info text and center it
        const infoDiv = document.createElement('div');
        infoDiv.style.width = '100%';
        infoDiv.style.textAlign = 'center';
        
        const info = document.createElement('p');
        info.className = 'text-gray-400 mb-4';
        info.textContent = `Showing results ${Math.min(totalResults, (currentPage - 1) * entriesPerPage + 1)} - ${Math.min(totalResults, currentPage * entriesPerPage)} of ${totalResults}`;
        
        infoDiv.appendChild(info);
        wrapDiv.appendChild(infoDiv); // Append info div to the wrapper
        
        // Create the buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center'; // Center the buttons within the button container
        
        // Create buttons for each page
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = 'pagination-button';
            
            if (i === currentPage) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => {
                currentPage = i;
                renderArchive();
                // Scroll to the top of the archive container after changing pages
                document.getElementById('movie-archive-container').scrollIntoView({ behavior: 'smooth' });
            });

            buttonsContainer.appendChild(button);
        }
        
        // Append the buttons container to the wrapper
        wrapDiv.appendChild(buttonsContainer);
        
        // Append the final wrapper to the controls container
        controlsContainer.appendChild(wrapDiv);
        
        // --- END Centering and Gap Reduction Logic ---
        
    } else if (currentSearchTerm !== '' && totalResults > 0) {
        // Show results count only if searching and all results fit on one page
         const info = document.createElement('p');
        info.className = 'text-gray-400 mb-4 text-center'; // Added text-center for consistency
        info.textContent = `Found ${totalResults} results.`;
        controlsContainer.appendChild(info);
    }
}


/**
 * Debounce function to limit how often a function is called.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
