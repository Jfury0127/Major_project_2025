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
    const res = await fetch('/api/studentInfo',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    const studentALLInfo = await res.json();
    //console.log(studentALLInfo);

    const studentInfo = studentALLInfo[0];
    const studentSubArray = studentALLInfo[1];

    if (studentInfo.STU_LNAME != null) {
        welcomename.textContent = `Welcome ${studentInfo.STU_FNAME} ${studentInfo.STU_LNAME}!`
    } else {
        welcomename.textContent = `Welcome ${studentInfo.STU_FNAME}!`
    }
    enr.textContent = `${studentInfo.ENR_NUMBER}`
    enr_num = studentInfo.ENR_NUMBER;

    section.textContent = `${studentInfo.SECTION_NAME}`;
    section_name = studentInfo.SECTION_NAME;
    //console.log(section_name);
    year.textContent = `Semester : ${studentInfo.STU_SEM}`;
    console.log(studentSubArray);
    studentSubArray.forEach((sub, i) => {
        const percentage = sub.total_lec ? `${(Math.round(sub.lec_taken / sub.total_lec * 100) / 100) * 100}%` : "NA"; // Multiplies, rounds, and divides
        const row = `<tr>
                <td class="px-4 py-2 border border-gray-400">${i + 1}</td>
                <td class="px-4 py-2 border border-gray-400 overflow-x-auto">${sub.SUB_NAME}</td>
                <td class="px-4 py-2 border border-gray-400">${sub.lec_taken}</td>
                <td class="px-4 py-2 border border-gray-400">${sub.total_lec}</td>
                <td class="px-4 py-2 border border-gray-400">${percentage}</td>
                <td class="px-4 py-2 border border-gray-400"> ${getRemark(percentage)}
                </td>
                <td class="px-4 py-2 border border-gray-400">
                    <div onclick="load_assign('${sub.SUB_ID}')" class="h-8 w-24 self-center 
                    bg-[#5254dd] hover:bg-[#5254dd]/90 rounded-lg cursor-pointer text-white 
                    font-medium flex justify-center items-center text-center m-auto">View</div>
                </td>
            </tr>`
        tablebody.insertAdjacentHTML("beforeend", row);
    });
}

function getRemark(num) {
    if (num == "NA") {
        return `<div class="present h-6 w-[98px] m-auto bg-gray-200 border-2 border-gray-400 rounded-md text-center text-gray-500 text-sm">Not Applicable</div>`;
    }
    else if (Math.round(parseFloat(num)) <= 30) {
        return `<div class="present h-6 w-20 m-auto bg-red-200 border-2 border-red-400 rounded-md text-center text-red-500">At risk</div>`;
    }
    else if (Math.round(parseFloat(num)) <= 50) {
        return `<div class="h-10 w-24 flex items-center justify-center m-auto bg-yellow-100 border-2 border-yellow-400 rounded-md text-center text-yellow-500">Need Improvement</div>`;
    }
    else {
        return `<div class="present h-6 w-20 m-auto bg-green-200 border-2 border-green-400 rounded-md text-center text-green-500">Excellent</div>`;
    }
}

// open the calender page
// function openPage(subId) {
//     // Redirect to a new page with query parameters
//     window.location.href = `/stu_more_info?subId=${subId}`;
// }
getInfo();

async function load_assign(subId) {
    try {
        
        show_assign_div.querySelector("tbody").innerHTML = "";
        
        // const mysubjectId = subId;
        // const mysectionname = section_name;
        // const enr_number = enr_num;
       const details = {subId: subId, secName:section_name, enr_number: enr_num};

        // console.log(subId);
        // console.log(section_name);
        // fetch 
        const response = await fetch('/api/stuAssignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        });
        const data = await response.json();
        // console.log(data);
        let numberofassign = 0;
        data.assignmentdata.forEach(i => {
            numberofassign = numberofassign + 1 ;
        })
        if(numberofassign!=0)show_assign_div.classList.remove("hidden");
        else{
            show_assign_div.classList.add("hidden");
            alert("Hurray! No Assignments");
        }
       
        data.assignmentdata.forEach((assignments,i) =>{
            
            const row = `<tr>
                    <td class="px-4 py-2 border border-gray-400">${i + 1}</td>
                    <td class="px-4 py-2 border border-gray-400">${assignments.Assign_Name}</td>
                    <td class="px-4 py-2 border border-gray-400 ">${assignments.Remark}</td>
                    <td class="px-4 py-2 border border-gray-400">${new Date(assignments.Date_of_arr).toLocaleDateString('en-CA')}</td>
                    <td class="px-4 py-2 border border-gray-400">${new Date(assignments.Due_date).toLocaleDateString('en-CA')}</td>
                    <td class="px-4 py-2 border border-gray-400">${assignments.Ref_to_assignment}</td>
                    <td class="px-4 py-2 border border-gray-400"> ${assignments.Date_of_submission ? new Date(assignments.Date_of_submission).toLocaleDateString('en-CA') : '-'}</td>
                    <td class="px-4 py-2 border border-gray-400"> ${assignments.Ref_to_submission}
                    </td>
                </tr>`
                assign_table.insertAdjacentHTML("beforeend", row);
        });

    }

    catch(error){
        console.log("error in fetching assignments for students",error);
    }
}

