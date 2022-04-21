const modal = document.querySelector(".modal");
const trigger = document.querySelector(".modal-trigger");
const closeButton = document.querySelector(".close-btn");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function updateTriggerText() {
    const boxes = [...document.querySelectorAll('.personBox:checked')].map(e => e.id);

    if (boxes.length > 0) {
        if (boxes.length > 1) {
            document.getElementById("modal-trigger").value = boxes.length + " people want this book";
        } else {
            const pName = [...document.querySelectorAll('.personBox:checked + label')].map(e => e.innerHTML);
            document.getElementById("modal-trigger").value = pName;
        }
    } else {
        document.getElementById("modal-trigger").value = "No one yet...";
    }
}

function closeModal() {
    updateTriggerText()    
    toggleModal();
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

// FROM: https://sabe.io/tutorials/how-to-create-modal-popup-box#introduction