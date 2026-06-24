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

    // Sort State
    let sortColumn = 'default';
    let sortDirection = 'asc'; // 'asc' or 'desc'

    // Smart search & Sort logic
    function applySearchAndSort() {
        const query = searchInput.value.trim().toLowerCase();
        
        // 1. Filter
        let filtered = [...products];
        if (query) {
            filtered = filtered.filter(product => {
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
        if (sortColumn === 'number') {
            filtered.sort((a, b) => {
                const valA = (a['رقم الصنف'] || '');
                const valB = (b['رقم الصنف'] || '');
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        } else if (sortColumn === 'price') {
            filtered.sort((a, b) => {
                const valA = parseFloat(a['اخر سعر شراء']) || 0;
                const valB = parseFloat(b['اخر سعر شراء']) || 0;
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            });
        }

        renderTable(filtered);
    }

    searchInput.addEventListener('input', applySearchAndSort);

    // Header click logic
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-sort');
            
            // Toggle direction if same column, else reset to asc
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }

            // Update icons
            document.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '↕');
            const icon = th.querySelector('.sort-icon');
            if (icon) {
                icon.textContent = sortDirection === 'asc' ? '↑' : '↓';
            }

            applySearchAndSort();
        });
    });
});
