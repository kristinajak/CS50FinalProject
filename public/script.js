// Opening and closing Contact us popup window
function openPopup() {
  const popup = document.getElementById("popupId");
  popup.classList.add("open-popup");
}

function closePopup() {
  const popup = document.getElementById("popupId");
  popup.classList.remove("open-popup");
}

// Displaying "Email Sent" message
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
if (message) {
  const messageEl = document.createElement('div');
  messageEl.innerText = message;
  messageEl.classList.add('message');
  document.body.prepend(messageEl);
}

function isChecked(table, itemId, item) {
  if (document.getElementById(`checkbox-${table}-${itemId}`).checked) {
    const payload = {
      itemId: itemId,
      table: table,
      item: item
    };
    console.log(payload);

    // Send the POST request to the back-end API endpoint
    fetch(`/checklist/api/moveItem/${table}`, { // Pass table name in the URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add any other headers required by your back-end
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the back-end
      // Perform any further actions based on the response
      console.log(data);
      
      // Update the view with the updated data
      updateChecklistView();
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error(error);
    });
  }
}

function updateChecklistView() {
  // Fetch the updated data and update the view
  fetch('/checklist') // Assuming the route is '/checklist'
    .then(response => response.text())
    .then(html => {
      // Replace the entire HTML content of the 'checklist' element with the updated view
      document.getElementById('checklist').innerHTML = html;
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error(error);
    });
}


