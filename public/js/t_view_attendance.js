document.addEventListener("DOMContentLoaded", () => {

    const viewAttendanceBtn = document.querySelector(".view-att-btn");
    const search_button = document.getElementById("search_button");
    const lectureSelect = document.getElementById("select-lect");
    const search_enr = document.getElementById("enr-search");
    const search_stu_div = document.getElementById("search_stu_div");
    const studentNameLabel = document.getElementById("studentNameLabel")
    const sectionLabel = document.getElementById("sectionLabel")
    const subjectLabel = document.getElementById("subjectLabel")
    const errorMessage = document.querySelector(".error-msg");
    const errorMessage2 = document.getElementById("error_msg2");
    const ctobeloaded = document.querySelector(".content-to-be-loaded");
    const rowsperpage = document.querySelector("#rows-per-page");
    const prevpage = document.querySelector("#prev-page");
    const nextpage = document.querySelector("#next-page");
    const pagemsg = document.querySelector(".page-msg");

    const view_grace_att_btn = document.getElementById('view-grace-att-btn');
    const gracesection = document.getElementById('grace-attendance-section');

    const month_button = document.getElementById("Monthly");
    const week_button = document.getElementById("Weekly");
    const weekly_data = document.getElementById("weeklydata");
    const monthly_data = document.getElementById("monthlydata");

    // call calender divs
    const calendarGrid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('monthLabel');
    const calendarGrid2 = document.getElementById('calendar-grid2');
    const weekLabel = document.getElementById('weekLabel');

    // const elementsToCheck = [
    //     viewAttendanceBtn, search_button, lectureSelect, search_enr, search_stu_div,
    //     studentNameLabel, sectionLabel, subjectLabel,
    //     errorMessage, errorMessage2, ctobeloaded
    // ];

    // elementsToCheck.forEach((el, idx) => {
    //     if (!el) console.warn(`Element ${idx + 1} is null or missing in the HTML`);
    // });

    let my_new_lec_data;
    viewAttendanceBtn.addEventListener("click", () => {
        console.log("View Attendance clicked. Selected Lecture ID:", lectureSelect.value);
        if (lectureSelect.value === "") {
            errorMessage.classList.remove("hidden"); // Show error message
        } else {
            errorMessage.classList.add("hidden"); // Hide error message if valid

            // Continue with attendance-taking actions here
            search_stu_div.classList.add("hidden");
            gracesection.classList.add('hidden');
            ctobeloaded.classList.remove("hidden");


            //////////////////////////////////////////////////////////////////////////////////
            // sectionID = parseInt(lectureSelected.slice(0, 3));
            // subID = lectureSelected.slice(4);
            
            // const sectionName = lectureSelected.split('-')[0]; // Extract section name
            // const subjectName = lectureSelected.split('-')[1]; // Extract subject name
            
            // const [sectionName, subjectName] = lectureSelected.split('-');
            
            // Get selected lecture data
            const lectureSelected_text = lectureSelect.options[lectureSelect.selectedIndex].text;
            const splitData = lectureSelected_text.split(' - ');
            if (splitData.length !== 2) {
                console.error("Error: Invalid lecture selection format.");
                return;
            }
            
            const sectionName = splitData[0].trim();
            const subjectName = splitData[1].trim();
            
            
            // Fetch student data for the selected section
            const lectureSelected = lectureSelect.value;
            const sectionID = parseInt(lectureSelected.slice(0, 3));
            // subID = lectureSelected.slice(4);

            fetch(`/api/get_students?section_id=${sectionID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    // Get student data from the response (assuming data has "stu" as the students array)
                    console.log("Attendance data received:", data);
                    const rowsData = data.stu;

                    const tablebody = document.querySelector("tbody");
                    tablebody.innerHTML = '';  // Clear existing rows
                    //////////////////////////////////////////////////////////////////////////////
                    // Fetch total lectures for the section and subject
                    fetch('/api/get_total_lectures', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            
                            section_name: sectionName,
                            subject_name: subjectName
                        })
                    })
                        .then(response => response.json())
                        .then(totalData => {
                            const totalLectures = totalData.totalLectures || 0; // Default to 0 if no lectures
                            ///////////////////////////////////

                            // Loop through each student and add rows to the table
                            rowsData.forEach((student, index) => {
                                if (student.STU_LNAME == null) {
                                    student.STU_LNAME = "";
                                }
                                const row = `<tr>
                        <td class="px-4 py-2 border border-gray-400">${index + 1}</td>
                        <td class="px-4 py-2 border border-gray-400">${student.ENR_NUMBER}</td>
                        <td class="px-4 py-2 border border-gray-400">${student.STU_FNAME} ${student.STU_LNAME}</td>
                        <td class="px-4 py-2 border border-gray-400 lectures-taken-${student.ENR_NUMBER}">Loading...</td> <!-- For lecture attendance taken -->
                        <td class="px-4 py-2 border border-gray-400 total-lectures">${totalLectures}</td> <!-- For total lectures -->
                        <td class="px-4 py-2 border border-gray-400 percentage-${student.ENR_NUMBER}">Loading...></td> <!-- For percentage of lectures -->
                    </tr>`;
                                tablebody.insertAdjacentHTML("beforeend", row);
                                // Fetch lectures taken for each student
                                fetch('/api/get_lectures_taken', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        enr_number: student.ENR_NUMBER,
                                        // section_name: sectionName,
                                        // subject_name: subjectName
                                        section_name: sectionName,
                                        subject_name: subjectName
                                    })
                                })
                                    .then(response => response.json())
                                    .then(lecturesData => {
                                        const lecturesTaken = lecturesData.lecturesTaken || 0; // Default to 0 if no lectures
                                        const lecturesTakenElement = document.querySelector(`.lectures-taken-${student.ENR_NUMBER}`);
                                        const percentageElement = document.querySelector(`.percentage-${student.ENR_NUMBER}`);

                                        if (lecturesTakenElement) {
                                            lecturesTakenElement.textContent = lecturesTaken;
                                        }
                                        if (percentageElement) {
                                            const percentage = totalLectures > 0 ? ((lecturesTaken / totalLectures) * 100).toFixed(2) : 0;
                                            percentageElement.textContent = `${percentage}%`;
                                        }
                                    })
                                    .catch(error => {
                                        console.error(`Error fetching lectures taken for ${student.ENR_NUMBER}:`, error);
                                    });
                            });
                        })
                        .catch(error => {
                            console.error('Error fetching total lectures:', error);
                        });
                })

                // attendanceStatus = Array(rowsData.length).fill(false);
                // // Initial render
                // renderPage(1).then(() => setupCheckboxListeners());
                .catch(error => {
                    console.error("Error fetching student data:", error);
                });


        }
    });


    lectureSelect.addEventListener('focus', () => {
        errorMessage.classList.add("hidden");
    })

    fetch('/api/teacher_lectures', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json()) // Parse the response as JSON
        .then(
            lectureData => {
                my_new_lec_data = lectureData;
                // Loop through each item in lectureData and create an option element
                lectureData.forEach(item => {
                    const option = document.createElement('option');
                    // option.value = item.SECTION_ID; // Using SECTION_ID as the option value
                    option.value = `${item.SECTION_ID} ${item.SUB_ID}`; 
                    option.textContent = `${item.SECTION_NAME} - ${item.SUB_NAME}`;
                    lectureSelect.appendChild(option);
                });
            })
        .catch(error => {
            console.error('Error fetching data:', error);
        });


    //////////////////////////        

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //grce att table
    view_grace_att_btn.addEventListener('click', async function () {
        const selectedLectureId = lectureSelect.value;

        if (selectedLectureId === "") {
            errorMessage.classList.remove("hidden"); // Show error message
        } else {
            errorMessage.classList.add("hidden"); // Hide error message if valid

            search_stu_div.classList.add("hidden");
            ctobeloaded.classList.add("hidden");

            // Show the grace attendance section
            gracesection.classList.remove('hidden'); //showing

            // Clear existing data
            const tbody = document.getElementById('grace-attendance-body');
            tbody.innerHTML = '';
            
            // fetch grace data for this lecture

            const sectionID = parseInt(selectedLectureId.slice(0, 3));
            const subID = selectedLectureId.slice(4);

            try
                {const params = new URLSearchParams();
                params.append("section_id", sectionID);
                params.append("sub_id", subID);

                const response = await fetch(`/api/getGraceDataForLec?${params}`,{
                    method: "GET",
                    headers: {
                        'Content-type': 'application/json'
                    },
                } )

                const display_data = await response.json();
                console.log(display_data);

                // Dummy rows for now, backend will provide real data later
                const dummyData = [
                    { enr: '135202722', name: 'Aryan kapoor', date: '2025-04-20', reason: 'Medical Emergency' },
                    { enr: '136202722', name: 'Akshat Jain', date: '2025-04-21', reason: 'Event Participation' },
                ];

                dummyData.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td class="px-4 py-2 border border-gray-400">${row.enr}</td>
                    <td class="px-4 py-2 border border-gray-400">${row.name}</td>
                    <td class="px-4 py-2 border border-gray-400">${row.date}</td>
                    <td class="px-4 py-2 border border-gray-400">${row.reason}</td>
                `;
                    tbody.appendChild(tr);
                });
            }catch(e){
                console.log("Error in fetching grace" ,e);
            }
        }
    });


    // =============================================================================================================================================================
    // search student using search bar js

    search_button.addEventListener("click", () => {

        var specialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

        console.log("Search clicked.", "Enrollment:", search_enr.value, "lecture id:", lectureSelect.value);
        // input validation
        if (search_enr.value === "" || search_enr.value === " ") {
            errorMessage2.textContent = "Input the Enr Number to be searched!"
            errorMessage2.classList.remove("hidden");
        } else if (specialCharacters.test(search_enr.value)) {
            errorMessage2.textContent = "Special Characters Detected ! Try again."
            errorMessage2.classList.remove("hidden");
        }
        else if (!Number.isInteger(parseFloat(search_enr.value))) {
            errorMessage2.textContent = "Invalid Value for Student Enrollment Number!"
            errorMessage2.classList.remove("hidden");
        } else if (search_enr.value.length < 9 || search_enr.value.length > 11) {
            errorMessage2.textContent = "Invalid Value for Student Enrollment Number!"
            errorMessage2.classList.remove("hidden");
        }
        else {
            errorMessage2.classList.add("hidden");
            ctobeloaded.classList.add("hidden");
            gracesection.classList.add('hidden');
            const search_enrol = search_enr.value;

            // laod student data 
            loadstudentdata(search_enrol);
        }
        // search_stu_div.classList.add("hidden");
        if (search_stu_div) search_stu_div.classList.add("hidden");
        return;
    })


    async function loadstudentdata(enr) {

        const search_enrol = enr;
        const t_lectures = my_new_lec_data;
        try {

            const params = new URLSearchParams();
            params.append("enr_num", search_enrol);

            console.log("Fetching student attendance for enr:", search_enr.value, "lecture:", lectureSelect.value);
            const response = await fetch(`/api/searchStuByTeacher?${params}`, {
                method: "GET",
                headers: {
                    'Content-type': 'application/json'
                },
            });

            const stu_data = await response.json();

            console.log("Student data received:", stu_data);
            // incorrect enr_number
            if (stu_data.length == 0) {
                errorMessage2.textContent = "Enrollment Number Not Found!"
                errorMessage2.classList.remove("hidden");
                return;
            }

            const stu_Section_Id = stu_data[0].SECTION_ID;

            // if student does not belong to any of the classes that the teacher teaches
            let flag = 0;
            let mylec;
            t_lectures.forEach(lec => {
                if (lec.SECTION_ID == stu_Section_Id) {
                    flag = 1;
                    mylec = lec;
                }
            })

            if (flag) {
                loadStuAttendanceForLecture(stu_data[0], mylec);
            }
            else {
                errorMessage2.textContent = "Student not in Any Lectures!"
                errorMessage2.classList.remove("hidden");
            }
            return;

        } catch (error) {
            console.log("error fetching student data: ", error);
        }

        return;
    }


    async function loadStuAttendanceForLecture(stu_data, lec) {

        const search_enr_num = stu_data.ENR_NUMBER;
        const stuname = stu_data.STU_FNAME + " " + stu_data.STU_LNAME;
        const secid = lec.SECTION_ID;
        const secname = lec.SECTION_NAME;
        const subid = lec.SUB_ID;
        const subname = lec.SUB_NAME;

        // load label details
        studentNameLabel.textContent = "Name:     " + stuname;
        sectionLabel.textContent = "Section:    " + secname;
        subjectLabel.textContent = "Subject:   " + subname;

        let attendanceData = {};
        let currentDate = new Date();

        const params = new URLSearchParams();
        params.append("enr_num", search_enr_num);
        params.append("sub", subid);

        try {
            // fetch attendance data for student
            const response = await fetch(`/api/searchStuAttendance?${params}`);
            attendanceData = await response.json();

            // create a map of the attendance data for better readability
            const attendanceMap = {};
            attendanceData.forEach(entry => {
                const dateObj = new Date(entry.Date);
                // const key = dateObj.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`; // Format: YYYY-MM-DD (local)
                attendanceMap[key] = entry.status; // 1 = present, 0 = absent
            });

            // shift month in monthly cal
            document.getElementById('prevMonth').addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                render_month_cal(attendanceMap, currentDate);
            });
            document.getElementById('nextMonth').addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                render_month_cal(attendanceMap, currentDate);
            });

            // shift week in weekly cal
            document.getElementById('prevWeek').addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() - 7); // Go to previous week
                render_week_cal(attendanceMap, currentDate);
            });

            document.getElementById('nextWeek').addEventListener('click', () => {
                currentDate.setDate(currentDate.getDate() + 7); // Go to next week
                render_week_cal(attendanceMap, currentDate);
            });

            month_button.addEventListener('click', () => {
                month_button.classList.add('active');
                week_button.classList.remove('active');

                monthly_data.classList.remove('hidden');
                weekly_data.classList.add('hidden');

                render_month_cal(attendanceMap, currentDate);
            })

            week_button.addEventListener('click', () => {
                week_button.classList.add('active');
                month_button.classList.remove('active');

                monthly_data.classList.add('hidden');
                weekly_data.classList.remove('hidden');

                render_week_cal(attendanceMap, currentDate);

            })

            month_button.click();
            ctobeloaded.classList.add("hidden");
            search_stu_div.classList.remove("hidden");
        }

        catch (e) {
            console.log("this error occured in fetching search stu attendance.");
            console.log("error: ", e);
        }
        return;
    }

    function render_day_labels(container) {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        container.innerHTML = ''; // clear existing content
        daysOfWeek.forEach(day => {
            container.innerHTML += `
          <div style="font-weight: bold; text-align: center; padding: 0.25rem;">
            ${day}
          </div>`;
        });
    }


    // display monthly calender 
    function render_month_cal(attendanceMap, currentDate) {
        //calendarGrid.innerHTML = '';
        render_day_labels(calendarGrid);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();

        monthLabel.textContent = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

        // Add blank days before start
        for (let i = 0; i < startDay; i++) {
            calendarGrid.innerHTML += `<div></div>`;
        }

        // display present absent and total taken letures in this month
        let pre = 0,abs = 0,tl = 0;
        // Fill in actual days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            let backgroundColor = '#f3f4f6';
            if (attendanceMap[dateKey] === 1){ backgroundColor = '#c0ffe8'; pre++;tl++;}
            else if (attendanceMap[dateKey] === 0){ backgroundColor = '#ffc9c9'; abs++;tl++;}

            calendarGrid.innerHTML += `
          <div style="background-color: ${backgroundColor}; padding: 0.5rem; text-align: center; border-radius: 0.25rem;">
            ${day}
          </div>`;
        }

        document.getElementById("present_span").textContent = "Present on : " + pre + " days";
        document.getElementById("absent_span").textContent = "Absent on : " + abs + " days";
        document.getElementById("totallec_span").textContent = "Total lecs: " + tl + " days";

    }

    // display weekly calendar
    function render_week_cal(attendanceMap, currentDate) {
        calendarGrid2.innerHTML = '';
        render_day_labels(calendarGrid2);


        // Get the current week range
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Adjust the date to the start of the current week (Sunday)
        const startOfWeek = currentDate.getDate() - currentDate.getDay();
        const firstDayOfWeek = new Date(year, month, startOfWeek);

        // Update the week label
        // const weekStartDate = firstDayOfWeek.toLocaleDateString();
        // const weekEndDate = new Date(firstDayOfWeek);
        // weekEndDate.setDate(weekEndDate.getDate() + 6); 
        // weekLabel.textContent = `Week of ${weekStartDate} - ${weekEndDate.toLocaleDateString()}`;
        const weekEndDate = new Date(firstDayOfWeek);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        const formatOptions = { day: 'numeric', month: 'long', year: '2-digit' };
        // OR: use { day: 'numeric', month: 'long', year: 'numeric' } for 2025 instead of 25

        // const weekStartDate = firstDayOfWeek.toLocaleDateString('en-GB', formatOptions);
        // const formattedEndDate = weekEndDate.toLocaleDateString('en-GB', formatOptions);

        const rawStart = firstDayOfWeek.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: '2-digit' });
        const rawEnd = weekEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: '2-digit' });

        const weekStartDate = rawStart.replace(/(\d{2})$/, "'$1");
        const formattedEndDate = rawEnd.replace(/(\d{2})$/, "'$1");

        weekLabel.textContent = `Week of ${weekStartDate} - ${formattedEndDate}`;

        // display present absent and total taken letures in this month
        let pre = 0,abs = 0,tl = 0;

        // Fill in the calendar for the week (7 days)
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(firstDayOfWeek);
            currentDay.setDate(firstDayOfWeek.getDate() + i);

            // const dateKey = currentDay.toISOString().split('T')[0];
            const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;


            let backgroundColor = '#f3f4f6';
            if (attendanceMap[dateKey] === 1){ backgroundColor = '#c0ffe8'; pre++;tl++;}
            else if (attendanceMap[dateKey] === 0){ backgroundColor = '#ffc9c9'; abs++;tl++;}

            calendarGrid2.innerHTML += `
          <div style="background-color: ${backgroundColor}; padding: 0.5rem; text-align: center; border-radius: 0.25rem;">
            ${currentDay.getDate()}
          </div>`;
        }

        document.getElementById("present_span_wk").textContent = "Present on : " + pre + " days";
        document.getElementById("absent_span_wk").textContent = "Absent on : " + abs + " days";
        document.getElementById("totallec_span_wk").textContent = "Total lecs: " + tl + " days";
    }
});
