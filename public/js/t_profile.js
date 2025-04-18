const lecturetable = document.getElementById('table-body');
const tid_div = document.querySelector('.tid');
const tname_div = document.querySelector('.tname');

let lectureData;
fetch('/api/teacher_lectures', {
    method: 'GET', // Specify the HTTP method
    headers: {
        'Content-Type': 'application/json' // Optional, but good to include for JSON data
    }
})
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        lectureData=data;
        // console.log(data); // Process the data received from the backend
        lectureData.forEach((lecture) => {
            const row = `<tr class="bg-[#DB2878]/20 mt-8 border-2">
                        <td class="px-2">${lecture.SECTION_ID}</td>
                        <td class="px-2">${lecture.SECTION_NAME}</td>
                        <td class="px-2">${lecture.SUB_ID}</td>
                        <td class="px-2">${lecture.SUB_NAME}</td>
            </tr>`;
            lecturetable.insertAdjacentHTML("beforeend", row);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

let teacher_details;
fetch('/api/teacher_details',{
    method: 'GET', // Specify the HTTP method
    headers: {
        'Content-Type': 'application/json' // Optional, but good to include for JSON data
    }
    }).then(response => response.json()).then((tdata) => {
        teacher_details = tdata;
        console.log(teacher_details);
        tid_div.textContent = `Teacher ID : ${teacher_details.F_ID}`;
        tname_div.textContent = `Teacher Name : ${teacher_details.F_FNAME}${teacher_details.F_LNAME ? teacher_details.F_LNAME : ""}`;
    });

