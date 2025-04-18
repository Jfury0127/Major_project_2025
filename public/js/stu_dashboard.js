const tablebody = document.querySelector('tbody');
const enr = document.getElementById('enr');
const section = document.getElementById('section');
const year = document.getElementById('year');
const welcomename = document.getElementById('welc-name');

async function getInfo(){
    const res = await fetch('/api/studentInfo',
        {method : 'GET', 
        headers : {
            'Content-Type': 'application/json'
        }}
    );
    const studentALLInfo = await res.json();
    console.log(studentALLInfo);

    const studentInfo = studentALLInfo[0];
    const studentSubArray = studentALLInfo[1];

    if(studentInfo.STU_LNAME != null){
        welcomename.textContent = `Welcome ${studentInfo.STU_FNAME} ${studentInfo.STU_LNAME}!`
    }else{
        welcomename.textContent = `Welcome ${studentInfo.STU_FNAME}!`
    }
    enr.textContent = `${studentInfo.ENR_NUMBER}`

    section.textContent = `${studentInfo.SECTION_NAME}`;
    year.textContent = `Semester : ${studentInfo.STU_SEM}`;

    studentSubArray.forEach((sub,i) => {
        const percentage = sub.total_lec ? `${(Math.round(sub.lec_taken/sub.total_lec * 100) / 100)*100}%` : "NA"; // Multiplies, rounds, and divides
        const row = `<tr>
                <td class="px-4 py-2 border border-gray-400">${i+1}</td>
                <td class="px-4 py-2 border border-gray-400 overflow-x-auto">${sub.SUB_NAME}</td>
                <td class="px-4 py-2 border border-gray-400">${sub.lec_taken}</td>
                <td class="px-4 py-2 border border-gray-400">${sub.total_lec}</td>
                <td class="px-4 py-2 border border-gray-400">${percentage}</td>
                <td class="px-4 py-2 border border-gray-400"> ${getRemark(percentage)}
                </td>
                <td class="px-4 py-2 border border-gray-400">
                    <div onclick="openPage('${sub.SUB_ID}')" class="h-8 w-24 self-center bg-[#5254dd] hover:bg-[#5254dd]/90 rounded-lg cursor-pointer text-white font-medium flex justify-center items-center text-center m-auto">More Info</div>
                </td>
            </tr>`
            tablebody.insertAdjacentHTML("beforeend",row);
    });
}

function getRemark(num){
    if(num=="NA"){
        return `<div class="present h-6 w-[98px] m-auto bg-gray-200 border-2 border-gray-400 rounded-md text-center text-gray-500 text-sm">Not Applicable</div>`;
    }
    else if (Math.round(parseFloat(num))<=30){
        return `<div class="present h-6 w-20 m-auto bg-red-200 border-2 border-red-400 rounded-md text-center text-red-500">At risk</div>`;
    }
    else if(Math.round(parseFloat(num))<=50){
        return `<div class="h-10 w-24 flex items-center justify-center m-auto bg-yellow-100 border-2 border-yellow-400 rounded-md text-center text-yellow-500">Need Improvement</div>`;
    }
    else{
        return `<div class="present h-6 w-20 m-auto bg-green-200 border-2 border-green-400 rounded-md text-center text-green-500">Excellent</div>`;
    }
}
function openPage(subId) {
    // Redirect to a new page with query parameters
    window.location.href = `/stu_more_info?subId=${subId}`;
}
getInfo();

