// const tablebody = document.querySelector('tbody');
const tablebody = document.getElementById('t1');
const assign_table = document.getElementById('t2');
const show_assign_div = document.getElementById('assignment_table');
const enr = document.getElementById('enr');
const section = document.getElementById('section');
const year = document.getElementById('year');
const welcomename = document.getElementById('welc-name');

let section_name = '';
let enr_num = '';

async function getInfo() {
    const res = await fetch('/api/studentInfo', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const studentALLInfo = await res.json();
    const studentInfo = studentALLInfo[0];
    const studentSubArray = studentALLInfo[1];

    welcomename.textContent = `Welcome ${studentInfo.STU_FNAME}${studentInfo.STU_LNAME ? ' ' + studentInfo.STU_LNAME : ''}!`;
    enr.textContent = studentInfo.ENR_NUMBER;
    enr_num = studentInfo.ENR_NUMBER;
    section.textContent = studentInfo.SECTION_NAME;
    section_name = studentInfo.SECTION_NAME;
    year.textContent = `Semester : ${studentInfo.STU_SEM}`;

    studentSubArray.forEach((sub, i) => {
        const percentage = sub.total_lec ? `${(Math.round(sub.lec_taken / sub.total_lec * 10000) / 100)}%` : "NA";
        const row = `<tr>
            <td class="px-4 py-2 border border-gray-400">${i + 1}</td>
            <td class="px-4 py-2 border border-gray-400">${sub.SUB_NAME}</td>
            <td class="px-4 py-2 border border-gray-400">${sub.lec_taken}</td>
            <td class="px-4 py-2 border border-gray-400">${sub.total_lec}</td>
            <td class="px-4 py-2 border border-gray-400">${percentage}</td>
            <td class="px-4 py-2 border border-gray-400">${getRemark(percentage)}</td>
            <td class="px-4 py-2 border border-gray-400">
                <div onclick="window.location.href='/stu_more_info?subId=${sub.SUB_ID}'" class="h-8 w-24 bg-[#5254dd] hover:bg-[#5254dd]/90 rounded-lg cursor-pointer text-white font-medium flex justify-center items-center m-auto">More</div>
            </td>
            <td class="px-4 py-2 border border-gray-400">
                <div onclick="load_assign('${sub.SUB_ID}')" class="h-8 w-24 bg-[#5254dd] hover:bg-[#5254dd]/90 rounded-lg cursor-pointer text-white font-medium flex justify-center items-center m-auto">View</div>
            </td>
        </tr>`;
        tablebody.insertAdjacentHTML("beforeend", row);
    });
}

function getRemark(num) {
    if (num === "NA") {
        return `<div class="present h-6 w-[98px] m-auto bg-gray-200 border-2 border-gray-400 rounded-md text-center text-gray-500 text-sm">Not Applicable</div>`;
    } else if (Math.round(parseFloat(num)) <= 30) {
        return `<div class="present h-6 w-20 m-auto bg-red-200 border-2 border-red-400 rounded-md text-center text-red-500">At risk</div>`;
    } else if (Math.round(parseFloat(num)) <= 50) {
        return `<div class="h-10 w-24 flex items-center justify-center m-auto bg-yellow-100 border-2 border-yellow-400 rounded-md text-center text-yellow-500">Need Improvement</div>`;
    } else {
        return `<div class="present h-6 w-20 m-auto bg-green-200 border-2 border-green-400 rounded-md text-center text-green-500">Excellent</div>`;
    }
}

getInfo();

async function load_assign(subId) {
    try {
        show_assign_div.querySelector("tbody").innerHTML = "";
        const details = { subId: subId, secName: section_name, enr_number: enr_num };

        const response = await fetch('/api/stuAssignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
        });

        const data = await response.json();

        if (data.assignmentdata.length > 0) {
            show_assign_div.classList.remove("hidden");
        } else {
            show_assign_div.classList.add("hidden");
            alert("Hurray! No Assignments");
        }

        data.assignmentdata.forEach((assignments, i) => {
            const submissionDate = assignments.Date_of_submission
                ? new Date(assignments.Date_of_submission).toLocaleDateString('en-CA')
                : '-';

            const submitCell = assignments.Date_of_submission
                ? `<td class="px-4 py-2 border border-gray-400"><a href="${assignments.Ref_to_submission}" target="_blank" class="text-blue-600 hover:underline"id = "view_2">View</a></td>`
                : `<td class="px-4 py-2 border border-gray-400">No submission</td>`;


            const row = `<tr>
                <td class="px-4 py-2 border border-gray-400">${i + 1}</td>
                <td class="px-4 py-2 border border-gray-400">${assignments.Assign_Name}</td>
                <td class="px-4 py-2 border border-gray-400">${assignments.Remark}</td>
                <td class="px-4 py-2 border border-gray-400">${new Date(assignments.Date_of_arr).toLocaleDateString('en-CA')}</td>
                <td class="px-4 py-2 border border-gray-400">${new Date(assignments.Due_date).toLocaleDateString('en-CA')}</td>
                <td class="px-4 py-2 border border-gray-400"><a href="${assignments.Ref_to_assignment}" target="_blank" id="view_1">View</a></td>
                <td class="px-4 py-2 border border-gray-400">${submissionDate}</td>
                ${submitCell}
                <td class="px-4 py-2 border border-gray-400">
                    <form id ="my_form_stu_Assign_hidden" onsubmit="submit_assignment_handler(event, '${assignments.Assign_Id}','${subId}')">
                        <input type="file" name="ass_sub" required />
                        <button type="submit" class="h-8 w-24 bg-[#5254dd] hover:bg-[#5254dd]/90 rounded-lg 
                        cursor-pointer text-white font-medium flex justify-center items-center m-auto"">Submit</button>
                    </form>
                </td>
            </tr>`;
            assign_table.insertAdjacentHTML("beforeend", row);
        });
        document.getElementById("view_1").style.color = "blue";
        document.getElementById("view_1").style.textDecoration = "underline";
        document.getElementById("view_2").style.color = "blue";
        document.getElementById("view_2").style.textDecoration = "underline";


    } catch (error) {
        console.error("Error fetching assignments:", error);
    }

}

function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function submit_assignment(assignId, file, subid) {
    const formData = new FormData();
    formData.append('assignment_id', assignId);
    formData.append('enr_number', enr_num);
    formData.append('assignment_file', file);

    const date_of_Sub = new Date();
    const date_send = getFormattedDate(date_of_Sub);
    formData.append('date', date_send);

    try {
        loadingOverlay.style.display = 'flex';
        const res = await fetch('/api/submitAssignment', {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            // alert('Assignment submitted successfully!');
            document.getElementById("spinner").classList.add("hidden");
            document.getElementById("text_loading").textContent = "Assignment submitted successfully!";
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                load_assign(subid);
                return;
            }, 2000); // 1000ms = 1 second

        } else {
            alert('Submission failed. Please try again.');
            loadingOverlay.style.display = 'none';
        }
    } catch (err) {
        console.error("Submission error:", err);
        alert('Error submitting assignment.');
    }
}

// This handler gets called from the inline form on each row
function submit_assignment_handler(event, assignId, subid) {
    event.preventDefault();
    const fileInput = event.target.querySelector('input[name="ass_sub"]');
    const file = fileInput.files[0];
    if (file) {
        submit_assignment(assignId, file, subid);
    }
}
//css








