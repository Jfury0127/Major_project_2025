const year = document.getElementById("year");
const sem = document.getElementById("sem");
const sec = document.getElementById("sec");
const sub = document.getElementById("sub");
const errormsg = document.querySelector(".error-msg");

function fetchSemSec() {
    const yearSelected = year.value;

    // Clear existing options
    sem.innerHTML = '<option value="" disabled selected hidden>Select Semester: </option>';

    if (yearSelected === '1') {
        sem.insertAdjacentHTML('beforeend', `
            <option value="1">1</option>
            <option value="2">2</option>
        `);
    } else if (yearSelected === '2') {
        sem.insertAdjacentHTML('beforeend', `
            <option value="3">3</option>
            <option value="4">4</option>
        `);
    } else if (yearSelected === '3') {
        sem.insertAdjacentHTML('beforeend', `
            <option value="5">5</option>
            <option value="6">6</option>
        `);
    } else {
        sem.insertAdjacentHTML('beforeend', `
            <option value="7">7</option>
            <option value="8">8</option>
        `);
    }
    fetchSec();
}

async function fetchSec(){
    const res = await fetch(`/api/hod_get_Section?year=${year.value}`,
        {method : 'GET', 
            headers : {
                'Content-Type': 'application/json'
        }}
    );
    const sections = await res.json();


    sec.innerHTML='<option value="" disabled selected hidden>Select Section:</option>';
    
    for (const section of sections) {
        sec.insertAdjacentHTML('beforeend',
            `<option value="${section.section_id}-${section.section_name}">${section.section_name}</option>
            `
        )
    }
}
async function fetchSubjects() {
    const selectedSemester = sem.value;
    if (selectedSemester) {
      try {
        const response = await fetch(`/api/hod-get-subjects?semester=${selectedSemester}`);
        const subjects = await response.json();
        // console.log("Fetched subjects:", subjects);

        sub.innerHTML = "<option value=''>Select Subject</option>";
        subjects.forEach(subject => {
          const option = document.createElement("option");
          option.value = `${subject.sub_id}-${subject.sub_name}`;
          option.textContent = subject.sub_name;
          sub.appendChild(option);
        });
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    }
  }

function viewatt(){
    if(year.value && sub.value && sec.value && sem.value){
        const secInfo = sec.value
        // Extract the section ID (first 3 characters)
        const sectionID = secInfo.slice(0, 3);

        // Extract the section name (remaining part)
        const sectionName = secInfo.slice(4);

        const [subjectID, subjectName] = sub.value.split('-')

        window.location.href = `/hod_view_att?secID=${sectionID}&secName=${sectionName}&subID=${subjectID}&subName=${subjectName}`;
    }
    else{
        errormsg.classList.toggle('hidden')
    }
}
function view_att2(){
    const section = document.getElementById("sec").value;
  const subject = document.getElementById("sub").value;
    const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const secId = section.split("-")[0];
  const subtId = subject.split("-")[0];
    if(year && sem && section && subject && startDate && endDate){
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/view_attendance";
    
        const inputs = [
          { name: "section_id", value: secId },
          { name: "subject_id", value: subtId },
          { name: "startDate", value: startDate },
          { name: "endDate", value: endDate }
        ];
    
        inputs.forEach(({ name, value }) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        });
    
        document.body.appendChild(form);
        form.submit(); // sends POST request and navigates to new page
  
  
    }
    else{
      errormsg.classList.toggle('hidden');
    }
  }
  
  
  async function generateReport() {
    const section = document.getElementById("sec").value;
    const subject = document.getElementById("sub").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
  
    const secId = section.split("-")[0];
    const subtId = subject.split("-")[0];
  
    // console.log({ secId, subtId, startDate, endDate });

    if(year && sem && section && subject && startDate && endDate){

  
    try {
      const response = await fetch('/api/getAttendanceDateRange', {
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
      });
  
      const data = await response.json();
  
      if (!Array.isArray(data) || data.length === 0) {
        alert("No data found for the selected date range.");
        return;
      }
  
      // Convert JSON to Excel worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
  
      // Create workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
  
      // Generate and download Excel file
      XLSX.writeFile(workbook, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Something went wrong while generating the report.");
    }
    }
    else{
        errormsg.classList.toggle('hidden');
    }
  }
  
  