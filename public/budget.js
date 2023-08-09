// Category dropdown button
const categoryDropdown = document.getElementById('categoryDropdown');
const categoryInput = document.getElementById('categoryInput');
const categoryItems = document.querySelectorAll('.dropdown-item');

categoryItems.forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedCategory = this.getAttribute('data-value');
        categoryDropdown.textContent = selectedCategory;
        categoryInput.value = selectedCategory;
    });
});

// Calculating the total
const quantityInput = document.querySelector('input[name="newQuantity"]');
const unitCostInput = document.querySelector('input[name="newUnit_cost"]');
const totalInput = document.getElementById('newTotal');
const addButton = document.querySelector('button[type="submit"]');


const calculateTotal = () => {
    const quantity = parseFloat(quantityInput.value);
    const unitCost = parseFloat(unitCostInput.value);
    const total = quantity * unitCost;
    totalInput.value = isNaN(total) ? '' : total.toFixed(2); // Update the total field or clear it if NaN
};

quantityInput.addEventListener('input', calculateTotal);
unitCostInput.addEventListener('input', calculateTotal);

addButton.addEventListener('click', () => {
    totalInput.classList.remove('hidden'); // Show the total field
});