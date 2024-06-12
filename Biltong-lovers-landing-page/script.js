function buyBiltong() {
    let name = prompt("What is your name?");
    let email = prompt("What is your email address?");

    if (name && email) {
        alert("Thank you, " + name + "! We'll be in touch by email");
    } else {
        alert("Please provide both your name and email address.");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    let buyButton = document.getElementById("buyButton");
    buyButton.addEventListener("click", buyBiltong);
});
