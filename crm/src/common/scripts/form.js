function setupFormSubmit(formId, apiEndpoint, callback = null) {
    var form = document.getElementById(formId);
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            handleFormSubmit(form, apiEndpoint, callback);
        });
    } else {
        console.error("Form with the specified ID not found.");
    }
}

function disableFormFields(formFields) {
    for (var i = 0; i < formFields.length; i++) {
        formFields[i].disabled = true;
    }
}

function enableFormFields(formFields) {
    for (var i = 0; i < formFields.length; i++) {
        formFields[i].disabled = false;
    }
}

function handleFormSubmit(form, apiEndpoint, callback) {
    var formFields = form.elements;
    var formData = {};
    for (var i = 0; i < form.elements.length; i++) {
        var field = form.elements[i];
        if (field.tagName === "INPUT" || field.tagName === "TEXTAREA" || field.tagName === "SELECT") {
            if(field.value.length > 0)
            {
                formData[field.name] = field.value;
            }
        }
    }

    disableFormFields(formFields);
    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data);
        enableFormFields(formFields);
        if (callback) {
            callback(null, data); 
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        enableFormFields(formFields);
        if (callback) {
            callback(error, null);
        }
    });
}

function init(callback = null) {
    setupFormSubmit("{{formId}}", "{{apiEndpoint}}", callback);
}