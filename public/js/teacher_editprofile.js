
// =======================================================rightdivjs

const container = document.getElementById("container");

const registerbtn = document.getElementById("register");
const leftmaindiv = document.getElementById("left_main_div");
const loginbtn = document.getElementById("login");
const rightmaindiv = document.getElementById("right_main_div");

registerbtn.addEventListener("click", (event) => {
  event.preventDefault();
  container.classList.add("active");
  rightmaindiv.style.display = 'block';

  function showrightdiv() {
    leftmaindiv.style.display = 'none';
  }
  const timeoutId = setTimeout(showrightdiv, 300);
  
});

loginbtn.addEventListener("click", () => {
  container.classList.remove("active");
  leftmaindiv.style.display = 'block';
  
  function showleftdiv(){
    rightmaindiv.style.display = 'none';
  }
  const timeoutId2 = setTimeout(showleftdiv, 300);
});

// =======================================================leftdivjs


// const fname = document.getElementById('fname')
//   const phone_number = document.getElementById('phone_number')
//   const form = document.getElementById('form')
//   const errorElement = document.getElementById('error')
//   const nameRegex = /^[A-Za-z]+$/; // Alphabet only
//   const phoneRegex = /^[0-9]+$/;   // Digits only

//   form.addEventListener('submit', (e) => {
//     let messages = []
//     if (fname.value === '' || fname.value == null) {
//       messages.push('First name is required')
//     }

//     if (phone_number.value.length < 10 || phone_number.value.length > 10 ) {
//       messages.push('Enter valid number')
//     }

//     // Validate full name
//     if (!nameRegex.test(fname)) {
//       messages.push('Enter valid name');
//     }

//     // Validate last name
//     if (!nameRegex.test(lname)) {
//       messages.push('Enter valid name');
//     }

//     // Validate phone number
//     if (!phoneRegex.test(phone_number)) {
//       messages.push('Enter valid phone number');
//     }
//     if (messages.length > 0) {
//       e.preventDefault()
//       errorElement.innerText = messages.join(', ')
//     }
  
//   });