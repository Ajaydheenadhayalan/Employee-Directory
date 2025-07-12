// data.js content simulated here for a single file solution
const mockEmployees = [
    { id: 1, firstName: 'Ajay', lastName: 'D', email: 'ajay@example.com', department: 'IT', role: 'Developer' },
    { id: 2, firstName: 'Deepakumar', lastName: 'M', email: 'deepak@example.com', department: 'IT', role: 'Developer' },
    { id: 3, firstName: 'Hariharan', lastName: 'C', email: 'hari@example.com', department: 'Finance', role: 'Analyst' },
    { id: 4, firstName: 'Arvindh', lastName: 'V', email: 'Aarvi@example.com', department: 'Marketing', role: 'Specialist' },
    { id: 5, firstName: 'Hariprasath', lastName: 'K', email: 'hp@example.com', department: 'Sales', role: 'Coordinator' },
    { id: 6, firstName: 'Frank', lastName: 'Miller', email: 'frank.m@example.com', department: 'HR', role: 'Recruiter' },
    { id: 7, firstName: 'Grace', lastName: 'Wilson', email: 'grace.w@example.com', department: 'IT', role: 'QA Engineer' },
    { id: 8, firstName: 'Heidi', lastName: 'Moore', email: 'heidi.m@example.com', department: 'Finance', role: 'Accountant' },
    { id: 9, firstName: 'Ivan', lastName: 'Taylor', email: 'ivan.t@example.com', department: 'Marketing', role: 'Content Creator' },
    { id: 10, firstName: 'Judy', lastName: 'Anderson', email: 'judy.a@example.com', department: 'Sales', role: 'Sales Rep' },
];

let employees = [...mockEmployees]; // The main array of employees
let filteredEmployees = []; // Employees after search/filter/sort
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = 'none';
let currentSearchTerm = '';
let currentFilter = {
    firstName: '',
    department: '',
    role: ''
};
let editingEmployeeId = null; // Stores the ID of the employee being edited

// --- DOM Element ---
const employeeGrid = document.getElementById('employeeGrid');
const searchInput = document.getElementById('searchInput');
const filterButton = document.getElementById('filterButton');
const addEmployeeButton = document.getElementById('addEmployeeButton');
const sortSelect = document.getElementById('sortSelect');
const showEntriesSelect = document.getElementById('showEntriesSelect');
const paginationControls = document.getElementById('paginationControls');
const pageNumbersContainer = document.getElementById('pageNumbers');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');

// Form Modal Elements
const employeeFormModal = document.getElementById('employeeFormModal');
const employeeFormContent = document.getElementById('employeeFormContent');
const formTitle = document.getElementById('formTitle');
const employeeForm = document.getElementById('employeeForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const departmentSelect = document.getElementById('department');
const roleSelect = document.getElementById('role');
const cancelFormButton = document.getElementById('cancelFormButton');

// Form Error Elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const departmentError = document.getElementById('departmentError');
const roleError = document.getElementById('roleError');

// Filter Sidebar Elements
const filterSidebar = document.getElementById('filterSidebar');
const closeFilterSidebarButton = document.getElementById('closeFilterSidebar');
const filterFirstNameInput = document.getElementById('filterFirstName');
const filterDepartmentInput = document.getElementById('filterDepartment');
const filterRoleInput = document.getElementById('filterRole');
const applyFilterButton = document.getElementById('applyFilterButton');
const resetFilterButton = document.getElementById('resetFilterButton');

// Confirmation Modal Elements
const confirmationModal = document.getElementById('confirmationModal');
const confirmationContent = document.getElementById('confirmationContent');
const confirmationMessage = document.getElementById('confirmationMessage');
const confirmCancelButton = document.getElementById('confirmCancelButton');
const confirmOkButton = document.getElementById('confirmOkButton');
let onConfirmCallback = null; 

// Info Modal Elements
const infoModal = document.getElementById('infoModal');
const infoContent = document.getElementById('infoContent');
const infoMessage = document.getElementById('infoMessage');
const infoOkButton = document.getElementById('infoOkButton');

// --- Utility Functions ---

/**
 * Generates a unique ID for new employees.
 * @returns {number}
 */
function generateUniqueId() {
    return employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
}

/**
 * Validates an email address format.
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Shows a custom confirmation modal.
 * @param {string} message
 * @param {function} onConfirm 
 */
function showConfirmationModal(message, onConfirm) {
    confirmationMessage.textContent = message;
    onConfirmCallback = onConfirm;
    confirmationModal.classList.remove('hidden');
    setTimeout(() => {
        confirmationContent.classList.remove('scale-95', 'opacity-0');
        confirmationContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

/**
 * Hides the confirmation modal.
 */
function hideConfirmationModal() {
    confirmationContent.classList.remove('scale-100', 'opacity-100');
    confirmationContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        confirmationModal.classList.add('hidden');
    }, 300); // Match transition duration
}

/**
 * Shows a custom info modal (for alerts).
 * @param {string} message 
 */
function showInfoModal(message) {
    infoMessage.textContent = message;
    infoModal.classList.remove('hidden');
    setTimeout(() => {
        infoContent.classList.remove('scale-95', 'opacity-0');
        infoContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}


function hideInfoModal() {
    infoContent.classList.remove('scale-100', 'opacity-100');
    infoContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        infoModal.classList.add('hidden');
    }, 300); // Match transition duration
}

// --- Rendering Functions ---

/**
 * Renders the employee cards in the grid.
 * @param {Array} employeesToRender
 */
function renderEmployeeCards(employeesToRender) {
    employeeGrid.innerHTML = ''; // Clear existing cards

    if (employeesToRender.length === 0) {
        employeeGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No employees found matching your criteria.</p>';
        return;
    }

    employeesToRender.forEach(employee => {
        const employeeCard = document.createElement('div');
        employeeCard.className = 'bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between';
        employeeCard.innerHTML = `
            <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">${employee.firstName} ${employee.lastName}</h3>
                <p class="text-sm text-gray-600 mb-1"><strong>ID:</strong> ${employee.id}</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Email:</strong> ${employee.email}</p>
                <p class="text-sm text-gray-600 mb-1"><strong>Department:</strong> ${employee.department}</p>
                <p class="text-sm text-gray-600 mb-4"><strong>Role:</strong> ${employee.role}</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 mt-4">
                <button class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-300 ease-in-out w-full sm:w-auto" data-id="${employee.id}">
                    Edit
                </button>
                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition duration-300 ease-in-out w-full sm:w-auto" data-id="${employee.id}">
                    Delete
                </button>
            </div>
        `;
        employeeGrid.appendChild(employeeCard);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = (e) => showFormModal(parseInt(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.onclick = (e) => handleDelete(parseInt(e.target.dataset.id));
    });
}

/**
 * Renders the pagination controls.
 * @param {number} totalPages 
 */
function renderPaginationControls(totalPages) {
    pageNumbersContainer.innerHTML = '';
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;

    const maxPageButtons = 5; // Max number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust startPage if we're at the end
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `px-3 py-1 rounded-lg transition duration-300 ease-in-out ${
            i === currentPage ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`;
        pageButton.onclick = () => {
            currentPage = i;
            renderApp();
        };
        pageNumbersContainer.appendChild(pageButton);
    }
}


function renderApp() {
    applyFiltersSortAndSearch();

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    // Ensure current page is valid after filtering/sorting
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 1; // Reset to page 1 if no results
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const employeesOnPage = filteredEmployees.slice(startIndex, endIndex);

    renderEmployeeCards(employeesOnPage);
    renderPaginationControls(totalPages);
}

// --- Filter, Sort, Search Logic ---

function applyFiltersSortAndSearch() {
    let tempEmployees = [...employees];

    // 1. Apply Search
    if (currentSearchTerm) {
        const searchTermLower = currentSearchTerm.toLowerCase();
        tempEmployees = tempEmployees.filter(emp =>
            emp.firstName.toLowerCase().includes(searchTermLower) ||
            emp.lastName.toLowerCase().includes(searchTermLower) ||
            emp.email.toLowerCase().includes(searchTermLower)
        );
    }

    // 2. Apply Filters
    const { firstName, department, role } = currentFilter;
    tempEmployees = tempEmployees.filter(emp => {
        const matchesFirstName = firstName ? emp.firstName.toLowerCase().includes(firstName.toLowerCase()) : true;
        const matchesDepartment = department ? emp.department.toLowerCase().includes(department.toLowerCase()) : true;
        const matchesRole = role ? emp.role.toLowerCase().includes(role.toLowerCase()) : true;
        return matchesFirstName && matchesDepartment && matchesRole;
    });

    // 3. Apply Sort
    if (currentSort !== 'none') {
        tempEmployees.sort((a, b) => {
            if (currentSort === 'firstName') {
                return a.firstName.localeCompare(b.firstName);
            } else if (currentSort === 'department') {
                return a.department.localeCompare(b.department);
            }
            return 0;
        });
    }

    filteredEmployees = tempEmployees;
}

// --- Form Handling ---

/**
 * Shows the add/edit employee form modal.
 * @param {number|null} employeeId
 */
function showFormModal(employeeId = null) {
    editingEmployeeId = employeeId;
    employeeForm.reset(); // Clear previous form data
    clearFormErrors();

    if (employeeId) {
        formTitle.textContent = 'Edit Employee';
        const employeeToEdit = employees.find(emp => emp.id === employeeId);
        if (employeeToEdit) {
            firstNameInput.value = employeeToEdit.firstName;
            lastNameInput.value = employeeToEdit.lastName;
            emailInput.value = employeeToEdit.email;
            departmentSelect.value = employeeToEdit.department;
            roleSelect.value = employeeToEdit.role;
        }
    } else {
        formTitle.textContent = 'Add Employee';
    }

    employeeFormModal.classList.remove('hidden');
    setTimeout(() => {
        employeeFormContent.classList.remove('scale-95', 'opacity-0');
        employeeFormContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

/**
 * Hides the add/edit employee form modal.
 */
function hideFormModal() {
    employeeFormContent.classList.remove('scale-100', 'opacity-100');
    employeeFormContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        employeeFormModal.classList.add('hidden');
        editingEmployeeId = null; 
    }, 300);
}

function clearFormErrors() {
    firstNameError.classList.add('hidden');
    lastNameError.classList.add('hidden');
    emailError.classList.add('hidden');
    departmentError.classList.add('hidden');
    roleError.classList.add('hidden');
}

/**
 * Validates the form fields.
 * @returns {boolean} 
 */
function validateForm() {
    clearFormErrors();
    let isValid = true;

    if (!firstNameInput.value.trim()) {
        firstNameError.classList.remove('hidden');
        isValid = false;
    }
    if (!lastNameInput.value.trim()) {
        lastNameError.classList.remove('hidden');
        isValid = false;
    }
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
        emailError.classList.remove('hidden');
        isValid = false;
    }
    if (!departmentSelect.value) {
        departmentError.classList.remove('hidden');
        isValid = false;
    }
    if (!roleSelect.value) {
        roleError.classList.remove('hidden');
        isValid = false;
    }
    return isValid;
}

/**
 * Handles the submission of the add/edit employee form.
 * @param {Event} event 
 */
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    if (!validateForm()) {
        return; // Stop if validation fails
    }

    const employeeData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentSelect.value,
        role: roleSelect.value
    };

    if (editingEmployeeId) {
        // Edit existing employee
        const index = employees.findIndex(emp => emp.id === editingEmployeeId);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
            showInfoModal('Employee updated successfully!');
        }
    } else {
        // Add new employee
        const newEmployee = {
            id: generateUniqueId(),
            ...employeeData
        };
        employees.push(newEmployee);
        showInfoModal('Employee added successfully!');
    }

    hideFormModal();
    renderApp(); // Re-render the employee list
}

/**
 * Handles the deletion of an employee.
 * @param {number} id 
 */
function handleDelete(id) {
    showConfirmationModal('Are you sure you want to delete this employee?', () => {
        employees = employees.filter(emp => emp.id !== id);
        showInfoModal('Employee deleted successfully!');
        renderApp(); // Re-render the employee list
        hideConfirmationModal();
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Search Input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        currentPage = 1; // Reset to first page on search
        renderApp();
    });

    // Filter Button (opens sidebar)
    filterButton.addEventListener('click', () => {
        filterSidebar.classList.remove('translate-x-full');
        filterSidebar.classList.add('translate-x-0');
    });

    // Close Filter Sidebar Button
    closeFilterSidebarButton.addEventListener('click', () => {
        filterSidebar.classList.remove('translate-x-0');
        filterSidebar.classList.add('translate-x-full');
    });

    // Apply Filter Button
    applyFilterButton.addEventListener('click', () => {
        currentFilter.firstName = filterFirstNameInput.value.trim();
        currentFilter.department = filterDepartmentInput.value.trim();
        currentFilter.role = filterRoleInput.value.trim();
        currentPage = 1; // Reset to first page on filter
        renderApp();
        filterSidebar.classList.remove('translate-x-0'); // Hide sidebar after applying
        filterSidebar.classList.add('translate-x-full');
    });

    // Reset Filter Button
    resetFilterButton.addEventListener('click', () => {
        filterFirstNameInput.value = '';
        filterDepartmentInput.value = '';
        filterRoleInput.value = '';
        currentFilter = { firstName: '', department: '', role: '' };
        currentPage = 1; // Reset to first page on reset
        renderApp();
        filterSidebar.classList.remove('translate-x-0'); // Hide sidebar after resetting
        filterSidebar.classList.add('translate-x-full');
    });

    // Add Employee Button
    addEmployeeButton.addEventListener('click', () => showFormModal());

    // Sort Select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1; // Reset to first page on sort
        renderApp();
    });

    // Show Entries Select
    showEntriesSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when items per page changes
        renderApp();
    });

    // Pagination Buttons
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderApp();
        }
    });
    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderApp();
        }
    });

    // Form Modal Buttons
    cancelFormButton.addEventListener('click', hideFormModal);
    employeeForm.addEventListener('submit', handleFormSubmit);

    // Confirmation Modal Buttons
    confirmCancelButton.addEventListener('click', hideConfirmationModal);
    confirmOkButton.addEventListener('click', () => {
        if (onConfirmCallback) {
            onConfirmCallback();
        }
    });

    // Info Modal Button
    infoOkButton.addEventListener('click', hideInfoModal);

    // Close modals if clicked outside
    employeeFormModal.addEventListener('click', (e) => {
        if (e.target === employeeFormModal) {
            hideFormModal();
        }
    });
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            hideConfirmationModal();
        }
    });
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            hideInfoModal();
        }
    });

    // Close filter sidebar on swipe (for mobile)
    let touchstartX = 0;
    let touchendX = 0;
    filterSidebar.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    });
    filterSidebar.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        if (touchendX < touchstartX - 50) { // Swiped left
            filterSidebar.classList.remove('translate-x-0');
            filterSidebar.classList.add('translate-x-full');
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderApp(); // Initial render of the employee list
});
