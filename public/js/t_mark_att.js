
const attendancedatediv = document.getElementById("att");
const attendanceDate = document.querySelector("#att-date");
const takeAttendanceBtn = document.querySelector(".take-att-btn");
const modifyAttendanceBtn = document.querySelector(".edit-att-btn");
const lectureSelect = document.getElementById("select-lect");
const errorMessage = document.querySelector(".error-msg");
const ctobeloaded = document.querySelector(".content-to-be-loaded");
const modify_main_div = document.querySelector(".modify_main_div");
const tablebody = document.querySelector("tbody");
const rowsperpage = document.querySelector("#rows-per-page");
const prevpage = document.querySelector("#prev-page");
const nextpage = document.querySelector("#next-page");
const pagemsg = document.querySelector(".page-msg");
const markallpresent = document.querySelector(".mark-all-present");
const recordlec = document.querySelector(".record-lec");
const recordCheckbox = document.querySelector('.recordlec-checkbox');
const saveAtt = document.querySelector('.save-att-btn');

// ===================================================================================
const enr_input = document.getElementById("enr_input"); 
const enr_error = document.getElementById("enr_error");
const date_input = document.getElementById("date_input" );
const date_error = document.getElementById("date_error");
const reason_input = document.getElementById("reason_input");
const reason_error = document.getElementById("reason_error");
const btn_modify_att = document.getElementById("btn_modify_att");
const modify_form = document.getElementById("signup-form");

// ===================================================================================

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Getting today's date
const today = new Date();
const todayFormatted = getFormattedDate(today);
// const todayFormatted = "2024-11-4";

attendanceDate.textContent = `${todayFormatted}`

let sectionID;
let subID;
let rowsData = [];
let attendanceStatus;

takeAttendanceBtn.addEventListener("click", () => {

    if (lectureSelect.value == "") {
        errorMessage.classList.remove("hidden"); // Show error message
    } else {
        modify_main_div.classList.add('hidden');
        errorMessage.classList.add("hidden"); // Hide error message if valid
        // Continue with attendance-taking actions here
        ctobeloaded.classList.remove("hidden");
        attendancedatediv.classList.remove('hidden');

        const lectureSelected = lectureSelect.value;

        sectionID = parseInt(lectureSelected.slice(0, 3));
        subID = lectureSelected.slice(4);


        fetch(`/api/get_students?section_id=${sectionID}&sub_id=${subID}&attendance_date=${todayFormatted}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(recieved_response => {
                studentData = recieved_response.stu;
                stat_array = recieved_response.stat;
                // console.log(stat_array);
                rowsData = studentData;

                if (stat_array == 0) {
                    let new_status = new Map();
                    // console.log(studentData[i].ENR_NUMBER);
                    for (let i = 0; i < studentData.length; i++) {
                        new_status.set(studentData[i].ENR_NUMBER, 0)
                    }
                    attendanceStatus = new_status;
                    // console.log(attendanceStatus);
                } else {
                    let new_status = new Map();
                    // console.log(stat_array.enr_number);
                    for (let j = 0; j < stat_array.length; j++) {
                        new_status.set(stat_array[j].enr_number, stat_array[j].status)
                    }
                    attendanceStatus = new_status;
                }
                // console.log("rows data" ,rowsData);
                // Initial render
                renderPage(1).then(() => setupCheckboxListeners());
            })
            .catch(error => {
                console.error("Error fetching student data:", error);
            });
        // Array to store attendance status
        // Initialize each student with a default status, e.g., "Absent" (false)
    }
});

lectureSelect.addEventListener('focus', () => {
    errorMessage.classList.add("hidden");
})

//1 Fetch request to get the lecture data
fetch('/api/teacher_lectures', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => response.json())
    .then(lectureData => {
        // Loop through each item in lectureData and create an option element
        lectureData.forEach(item => {
            const option = document.createElement('option');
            option.value = `${item.SECTION_ID} ${item.SUB_ID}`; // Using SECTION_ID as the option value
            option.textContent = `${item.SECTION_NAME} - ${item.SUB_NAME}`;
            lectureSelect.appendChild(option);

            // modifyAttendanceBtn.click(); // testing
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


let currentpage = 1;

// Handling the next and previous page buttons
nextpage.addEventListener('click', () => {
    const rows = rowsperpage.value === "all" ? rowsData.length : parseInt(rowsperpage.value, 10)
    const totalPages = Math.ceil(rowsData.length / rows);
    if (currentpage < totalPages) { currentpage++; }
    else {
        currentpage = totalPages;
    }
    renderPage(currentpage).then(() => setupCheckboxListeners());
})
prevpage.addEventListener('click', () => {
    if (currentpage > 1) { currentpage--; }
    else {
        currentpage = 1;
    }
    renderPage(currentpage).then(() => setupCheckboxListeners());
})



//render data rows acc to page number
async function renderPage(page) {
    tablebody.innerHTML = "";  // Clear previous rows

    let rowsperpageValue = rowsperpage.value;
    const rows = rowsperpageValue === "all" ? rowsData.length : parseInt(rowsperpageValue, 10); //no. of rows to be shown
    const startIndex = (page - 1) * rows;
    //rowsData.length can be less than rowsperpageValue selected
    const endIndex = Math.min(startIndex + rows, rowsData.length);


    for (let i = startIndex; i < endIndex; i++) {
        const student = rowsData[i];
        if (student.STU_LNAME == null) {
            student.STU_LNAME = "";
        }

        if (attendanceStatus == 0) {
            var isPresent = false;
        } else if (attendanceStatus == 1) {
            var isPresent = true;
        }
        else {
            if (attendanceStatus.has(student.ENR_NUMBER)) {
                const x = attendanceStatus.get(student.ENR_NUMBER);
                if (x == 0) {
                    isPresent = false;
                } else {
                    isPresent = true;
                }
            } else {
                isPresent = false;
            }
        }
        var row = `
            <tr>
                <td class="border-2 px-4 py-2">${student.ENR_NUMBER}</td>
                <td class="border-2 px-4 py-2">${student.STU_FNAME} ${student.STU_LNAME} </td>
                <td class="border-2 px-4 py-2 text-center"><input type="checkbox" class="checkbox" ${isPresent ? "checked" : ""} data-index="${i}">
                </td>
                <td class="border-2 px-4 py-2 text-center"><div class="${isPresent ? 'present h-6 w-16 m-auto bg-green-200 border-2 border-green-400 rounded-md text-center text-green-500' : 'absent h-6 w-16 m-auto bg-red-200 border-2 border-red-400 rounded-md text-center text-red-500'}">
                    ${isPresent ? "Present" : "Absent"}
                    </div>
                </td>

            </tr>
        `;
        tablebody.insertAdjacentHTML("beforeend", row);
        // row.classList.add("attendance-row");
    }


    const totalPages = Math.ceil(rowsData.length / rows);
    pagemsg.textContent = `Page ${page} of ${totalPages}`;
}

rowsperpage.addEventListener("change", () => {
    currentpage = 1; // Reset to the first page
    renderPage(currentpage).then(() => setupCheckboxListeners());
});

// Async function to set up event listeners after rendering the table
async function setupCheckboxListeners() {
    document.querySelectorAll(".checkbox").forEach(checkbox => {
        checkbox.addEventListener("click", handleCheckboxClick);
    });
}
// Update attendanceStatus and UI when checkbox is clicked
function handleCheckboxClick(e) {
    const index = e.target.getAttribute("data-index");
    const isChecked = e.target.checked;

    // Update the status display in the last cell
    const tablerow = e.target.closest('tr');
    const enr = parseInt(tablerow.firstElementChild.textContent);
    attendanceStatus.set(enr, isChecked ? 1 : 0);
    // console.log(attendanceStatus);
    tablerow.lastElementChild.innerHTML = `
        <div class="${isChecked ? 'present h-6 w-16 m-auto bg-green-200 border-2 border-green-400 rounded-md text-center text-green-500' : 'absent h-6 w-16 m-auto bg-red-200 border-2 border-red-400 rounded-md text-center text-red-500'}">
            ${isChecked ? "Present" : "Absent"}
        </div>
    `;
}

markallpresent.addEventListener('click', () => {
    
    if (markallpresent.textContent == "Mark All Present") {
        // attendanceStatus = 1;
        for (let key of attendanceStatus.keys()) {
            attendanceStatus.set(key, 1);
        }
        
        markallpresent.textContent = "Mark All Absent";
    }
    else if (markallpresent.textContent == "Mark All Absent") {
        
        for (let key of attendanceStatus.keys()) {
            attendanceStatus.set(key, 0);
        }
        markallpresent.textContent = "Mark All Present";
        
    }
    renderPage(currentpage).then(() => setupCheckboxListeners());
})

saveAtt.addEventListener('click', () => {

    const attendanceDate = todayFormatted;
    const subjectId = subID;
    const sectionId = sectionID;

    // Convert the Map into an array of objects for sending to the backend
    const attendanceData = Array.from(attendanceStatus, ([enr_number, status]) => ({
        attendance_date: attendanceDate,
        enr_number,
        sub_id: subjectId,
        section_id: sectionId,
        status
    }));

    // Send the data to the backend
    saveAttendance(attendanceData);

});

function saveAttendance(data) {
    fetch('/markAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Attendance saved successfully!');
                location.reload();
            } else {
                alert('Error saving attendance: ' + result.message);
            }
        })
        .catch(err => console.error('Fetch Error:', err));
}



// ===========================================================================================================================

// modify attendance

modifyAttendanceBtn.addEventListener("click", () => {

    if (lectureSelect.value == "") {
        errorMessage.classList.remove("hidden"); 
    } else {
        errorMessage.classList.add("hidden"); 
        
        modify_main_div.classList.remove("hidden");
        ctobeloaded.classList.add('hidden');
        attendancedatediv.classList.add('hidden');
    }
    return;
});

enr_input.addEventListener('focus', () => {
    enr_error.classList.add("hidden");
})

date_input.addEventListener('focus', () => {
    date_error.classList.add("hidden");
})

reason_input.addEventListener('focus', () => {
    reason_error.classList.add("hidden");
})


async function modifyAttendance(event){
    event.preventDefault();
    // document.getElementById("date_input").max = todayFormatted;
    const data = new FormData(modify_form);
    
    const form_recieved_enr = data.get("enr_input");
    const form_recieved_date = data.get("date_input");
    const form_recieved_reason = data.get("reason_input");

    // form validation

        // 1. Basic sanitization to prevent special characters
        const specialCharPattern = /[^a-zA-Z0-9\s\-.,']/;
        if (specialCharPattern.test(form_recieved_enr) || 
            specialCharPattern.test(form_recieved_date) || 
            specialCharPattern.test(form_recieved_reason)) {
            alert('Bad input read. Try again!');
            return;
        }

        // 2. ENR must be numeric only
        if ((!/^\d+$/.test(form_recieved_enr)) || (form_recieved_enr.length < 9 || form_recieved_enr.length > 11)) {
            enr_error.textContent = `Invalid Student Enrollment Number!`;
            enr_error.classList.remove("hidden");
            return;
        }

        // 3. Date must be strictly less than today
        if (form_recieved_date >= todayFormatted) {
            date_error.textContent = "Cannot modify attendance for future lectures!";
            date_error.classList.remove("hidden");
            return;
        }

    // modify att based on form values
    
    const lectureSelected = lectureSelect.value;
    sectionID = parseInt(lectureSelected.slice(0, 3));
    subID = lectureSelected.slice(4);
    
    try{
        // using new api that sends date and enr to check lecture presence , student presence , student status and then updating attendance
        // and saving data in misc table

        const response = await fetch(`/api/modify_att?section_id=${sectionID}&sub_id=${subID}&attendance_date=${form_recieved_date}&form_enr=${form_recieved_enr}&reason=${form_recieved_reason}`);
        const student_date_Record = await response.json();
        
        // if no lecture was taken on this day
        if(student_date_Record == 0){ 
            date_error.textContent = "No lecture was taken on this date!";
            date_error.classList.remove("hidden");
            return;
        }
        // wrong enr number i.e. student not in this section
        else if(student_date_Record == 1){ 
            enr_error.textContent = `Invalid Student Enr for this Section!`;
            enr_error.classList.remove("hidden");
            return;
        }
        // enr already present on that date
        else if(student_date_Record == 2){ 
            enr_error.textContent = "Student was already present in this lecture!";
            enr_error.classList.remove("hidden");
            return;
        }
        // success
        else if(student_date_Record == 3){
            alert('Student Attendance succesfully modified!');
            window.location.reload();            
        }
        // unknow error
        else {
            alert('Failed. Please try again.');
        }
        
    }catch(e){
        console.error("eeor in modification");
    }
    
    return;
}
// // 
btn_modify_att.addEventListener('click',modifyAttendance);
