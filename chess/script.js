function payNow() {

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let amount = document.getElementById("course").value;

    if(name === "" || email === "" || phone === ""){
        alert("Please fill all details");
        return;
    }

    let options = {
        key: "YOUR_RAZORPAY_KEY_ID",

        amount: amount * 100,

        currency: "INR",

        name: "Grandmaster Chess Academy",

        description: "Course Registration",

        handler: function(response){

            alert(
                "Payment Successful!\nPayment ID: "
                + response.razorpay_payment_id
            );

            document.getElementById(
                "registrationForm"
            ).reset();
        },

        prefill: {
            name: name,
            email: email,
            contact: phone
        },

        theme: {
            color: "#000000"
        }
    };

    let rzp = new Razorpay(options);
    rzp.open();

}
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    });
}



  
  




  