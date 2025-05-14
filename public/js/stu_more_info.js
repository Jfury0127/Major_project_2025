monthyear = document.querySelector('.monthyear')
const tr = document.querySelectorAll('tbody tr');
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const prev = document.querySelector('#prev')
const next = document.querySelector('#next')

async function getMOREInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const subId = urlParams.get('subId');
    console.log(typeof(subId));
    const res = await fetch(`/api/detailedStuAttendance?subId=${subId}`,
        {method : 'GET', 
        headers : {
            'Content-Type': 'application/json'
        }}
    );
    const detailedAttendance = await res.json();
    console.log("from js, detailedatt:",detailedAttendance);
    const attMap = new Map();
    for (const row of detailedAttendance) {
        attMap.set(row.attendance_date, row.status);
    }
    console.log("from js, att map:",attMap);
    return attMap;
}
let currentMonth = (new Date()).getMonth();
let currentYear = (new Date()).getFullYear();

async function loadcalender(year,month) {
    
    monthyear.textContent = `${months[month]} ${year}`;

    let firstDayOfMonth = new Date(year,month).getDay();
    let NumberOfDaysInMonth = new Date(year,month+1,0).getDate();
    
    const attMap = await getMOREInfo();
    let dayDate = 1;

    tr.forEach((row)=>{
        row.innerHTML='';
    })

    tr.forEach((row,index)=>{
        if(index === 0){     //first row
            for(let day = 0; day<=6; day++){
                if(day<firstDayOfMonth){
                    const td = document.createElement('td');
                    td.classList = 'p-4 text-center';
                    row.append(td)
                }
                else{
                    const td = makeTDbasedOnStatus(attMap,dayDate,currentYear,currentMonth+1);
                    row.append(td);
                    dayDate++;
                }
            }
        }
        else{
        for(let day = 0; day<=6; day++){
            if(dayDate <= NumberOfDaysInMonth){
                const td = makeTDbasedOnStatus(attMap,dayDate,currentYear,currentMonth+1);
                dayDate++;
                row.append(td);
            }
        }}
        
    })    
}

function makeTDbasedOnStatus(attMap,dayDate,year,month){
    // let date;
    // if(dayDate < 10) {
    //      date = `${year}-${month}-0${dayDate}`
    // }else{
    //      date = `${year}-${month}-${dayDate}`
    // }
    const pad = (num) => num.toString().padStart(2, '0');
    const date = `${year}-${pad(month)}-${pad(dayDate)}`;

    const td = document.createElement('td');
    td.textContent = dayDate;
    if (attMap.get(date)==0){
        const td = document.createElement('td')
        td.textContent = dayDate;
        td.classList = 'p-4 text-center bg-red-300 border border-black';
        return td;
    }
    else if(attMap.get(date)==1){
        const td = document.createElement('td')
        td.textContent = dayDate;
        td.classList = 'p-4 text-center bg-green-300 border border-black';
        return td;
    }
    else{
        const td = document.createElement('td')
        td.textContent = dayDate;
        td.classList = 'p-4 text-center bg-gray-200 border border-black';
        return td;
    }
}

loadcalender(currentYear,currentMonth);
// getMOREInfo();

next.addEventListener('click',()=>{
    if(currentMonth==11){
        currentYear++;
        currentMonth = 0;
    }
    else{
        currentMonth++;
    }
    
    loadcalender(currentYear,currentMonth);
})
prev.addEventListener('click',()=>{
    if(currentMonth==0){
        currentYear--;
        currentMonth = 11;
    }
    else{
        currentMonth--;
    }
    
    loadcalender(currentYear,currentMonth);
})