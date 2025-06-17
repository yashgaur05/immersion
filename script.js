class ProductSearch {
    constructor() {
        this.searchForm = document.getElementById('searchForm');
        this.searchInput = document.getElementById('searchInput');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.resultsHeader = document.getElementById('resultsHeader');
        this.resultsTitle = document.getElementById('resultsTitle');
        this.resultsCount = document.getElementById('resultsCount');
        this.productGrid = document.getElementById('productGrid');
        this.noResults = document.getElementById('noResults');
        this.errorContainer = document.getElementById('errorContainer');
        this.errorText = document.getElementById('errorText');

        this.apiBaseUrl = 'https://dummyjson.com/products/search';
        this.currentSearchTerm = '';

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('input', () => this.clearError());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch(e);
            }
        });
    }

    validateSearchInput(searchTerm) {
        const trimmedTerm = searchTerm.trim();
        
        if (!trimmedTerm) {
            this.showError('Please enter a product name to search');
            return false;
        }

        if (trimmedTerm.length < 2) {
            this.showError('Search term must be at least 2 characters long');
            return false;
        }

        return true;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        this.searchInput.classList.add('error');
        this.searchInput.focus();
    }

    clearError() {
        this.errorMessage.classList.remove('show');
        this.searchInput.classList.remove('error');
    }

    showLoading() {
        this.hideAllSections();
        this.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    hideAllSections() {
        this.loadingSpinner.classList.add('hidden');
        this.resultsHeader.classList.add('hidden');
        this.productGrid.innerHTML = '';
        this.noResults.classList.add('hidden');
        this.errorContainer.classList.add('hidden');
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const searchTerm = this.searchInput.value.trim();
        
        if (!this.validateSearchInput(searchTerm)) {
            return;
        }

        this.currentSearchTerm = searchTerm;
        this.clearError();
        this.showLoading();

        try {
            const products = await this.searchProducts(searchTerm);
            this.displayResults(products, searchTerm);
        } catch (error) {
            this.showErrorState(error.message);
        }
    }

    async searchProducts(searchTerm) {
        const url = `${this.apiBaseUrl}?q=${encodeURIComponent(searchTerm)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    displayResults(data, searchTerm) {
        this.hideLoading();

        if (!data.products || data.products.length === 0) {
            this.showNoResults();
            return;
        }

        this.showResults(data.products, searchTerm, data.total);
    }

    showResults(products, searchTerm, total) {
        this.resultsHeader.classList.remove('hidden');
        this.resultsTitle.textContent = `Search Results for "${searchTerm}"`;
        this.resultsCount.textContent = `Found ${total} product${total !== 1 ? 's' : ''}`;

        this.productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            this.productGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const rating = product.rating || 0;
        const stars = this.generateStars(rating);

        card.innerHTML = `
            <img 
                src="${product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/280x200?text=No+Image'}" 
                alt="${product.title}"
                class="product-image"
                onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'"
            >
            <div class="product-info">
                <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-text">(${rating.toFixed(1)})</span>
                </div>
                <p class="product-description">${this.escapeHtml(product.description || 'No description available')}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    showNoResults() {
        this.hideLoading();
        this.noResults.classList.remove('hidden');
    }

    showErrorState(errorMessage) {
        this.hideLoading();
        this.errorText.textContent = errorMessage;
        this.errorContainer.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductSearch();
});
