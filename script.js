document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const noResults = document.getElementById('noResults');
    const tableContainer = document.querySelector('.table-container');

    // Number formatter for price
    const formatter = new Intl.NumberFormat('ar', {
        style: 'decimal',
        minimumFractionDigits: 0
    });

    // Render table rows
    function renderTable(data) {
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            tableContainer.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }

        tableContainer.classList.remove('hidden');
        noResults.classList.add('hidden');

        // To improve performance if there are many rows, use DocumentFragment
        const fragment = document.createDocumentFragment();

        data.forEach(product => {
            const tr = document.createElement('tr');
            
            const num = product['رقم الصنف'] || '';
            const name = product['اسم الصنف'] || '';
            const rawPrice = product['اخر سعر شراء'];
            
            let price = rawPrice;
            if (rawPrice && !isNaN(rawPrice)) {
                price = formatter.format(parseFloat(rawPrice));
            }

            tr.innerHTML = `
                <td>${num}</td>
                <td>${name}</td>
                <td class="price">${price}</td>
            `;
            fragment.appendChild(tr);
        });

        tableBody.appendChild(fragment);
    }

    // Initial render
    renderTable(products);

    const sortSelect = document.getElementById('sortSelect');

    // Smart search & Sort logic
    function applySearchAndSort() {
        const query = searchInput.value.trim().toLowerCase();
        let sortValue = 'default';
        if (sortSelect) sortValue = sortSelect.value;
        
        // 1. Filter
        let filtered = products;
        if (query) {
            filtered = products.filter(product => {
                const num = (product['رقم الصنف'] || '').toLowerCase();
                const name = (product['اسم الصنف'] || '').toLowerCase();
                const price = (product['اخر سعر شراء'] || '').toLowerCase();
                
                // Smart search: Check if query terms are all present in the product string
                const searchTerms = query.split(' ');
                const searchableText = `${num} ${name} ${price}`;
                
                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // 2. Sort
        if (sortValue === 'number') {
            filtered.sort((a, b) => (a['رقم الصنف'] || '').localeCompare(b['رقم الصنف'] || ''));
        } else if (sortValue === 'price-asc') {
            filtered.sort((a, b) => (parseFloat(a['اخر سعر شراء']) || 0) - (parseFloat(b['اخر سعر شراء']) || 0));
        } else if (sortValue === 'price-desc') {
            filtered.sort((a, b) => (parseFloat(b['اخر سعر شراء']) || 0) - (parseFloat(a['اخر سعر شراء']) || 0));
        }

        renderTable(filtered);
    }

    searchInput.addEventListener('input', applySearchAndSort);
    if (sortSelect) {
        sortSelect.addEventListener('change', applySearchAndSort);
    }
});
