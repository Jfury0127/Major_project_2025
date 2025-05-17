const year = document.getElementById("year").value;
const sem = document.getElementById("sem").value;
const section = document.getElementById("sec").value;
const subject = document.getElementById("sub").value;
const startDate = document.getElementById("startDate").value;
const endDate = document.getElementById("endDate").value;
const errormsg = document.querySelector(".error-msg");


const secId = section.split("-")[0];
const subtId = subject.split("-")[0];

function view_att2(){
  const section = document.getElementById("sec").value;
const subject = document.getElementById("sub").value;
  const startDate = document.getElementById("startDate").value;
const endDate = document.getElementById("endDate").value;
const secId = section.split("-")[0];
const subtId = subject.split("-")[0];
  if(year && sem && section && subject && startDate && endDate){
    fetch('/hod/view-attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        section_id: secId,
        subject_id: subtId,
        startDate: startDate,
        endDate: endDate
      })
    })
    .then(response => response.json())
    .then(data => {
  
    })
    .catch(error => console.error("Error:", error));


  }
  else{
    errormsg.classList.toggle('hidden')
  }
}


function generateReport(){
  const section = document.getElementById("sec").value;
const subject = document.getElementById("sub").value;
  const startDate = document.getElementById("startDate").value;
const endDate = document.getElementById("endDate").value;
const secId = section.split("-")[0];
const subtId = subject.split("-")[0];

fetch('/api/getAttendanceDateRange', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    section_id: secId,
    subject_id: subtId,
    startDate: startDate,
    endDate: endDate
  })
})
.then(response => response.json())
.then(data => {
  
})
.catch(error => console.error("Error:", error));

}

