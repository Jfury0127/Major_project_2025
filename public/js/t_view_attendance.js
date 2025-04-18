const viewAttendanceBtn = document.querySelector(".view-att-btn");
const lectureSelect = document.getElementById("select-lect");
const errorMessage = document.querySelector(".error-msg");
const ctobeloaded = document.querySelector(".content-to-be-loaded");
const rowsperpage = document.querySelector("#rows-per-page");
const prevpage = document.querySelector("#prev-page");
const nextpage = document.querySelector("#next-page");
const pagemsg = document.querySelector(".page-msg");

viewAttendanceBtn.addEventListener("click", () => {
    if (lectureSelect.value === "") {
        errorMessage.classList.remove("hidden"); // Show error message
    } else {
        errorMessage.classList.add("hidden"); // Hide error message if valid
        // Continue with attendance-taking actions here
        ctobeloaded.classList.remove("hidden");

        //////////////////////////////////////////////////////////////////////////////////
        // const lectureSelected = lectureSelect.value;
        // sectionID = parseInt(lectureSelected.slice(0, 3));
        // subID = lectureSelected.slice(4);

        // const sectionName = lectureSelected.split('-')[0]; // Extract section name
        // const subjectName = lectureSelected.split('-')[1]; // Extract subject name

        // const [sectionName, subjectName] = lectureSelected.split('-');

        // Get selected lecture data
        const lectureSelected = lectureSelect.options[lectureSelect.selectedIndex].text;
        const splitData = lectureSelected.split(' - ');
        if (splitData.length !== 2) {
            console.error("Error: Invalid lecture selection format.");
            return;
        }

        const sectionName = splitData[0].trim();
        const subjectName = splitData[1].trim();

        // Fetch student data for the selected section
        const sectionID = parseInt(lectureSelect.value);

        fetch(`/api/get_students?section_id=${sectionID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                // Get student data from the response (assuming data has "stu" as the students array)
                const rowsData = data.stu;

                const tablebody = document.querySelector("tbody");
                tablebody.innerHTML = '';  // Clear existing rows
                //////////////////////////////////////////////////////////////////////////////
                // Fetch total lectures for the section and subject
                fetch('/api/get_total_lectures', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // section_name: sectionName, subject_name: subjectName 
                        // section_name: lectureSelected.section_name,
                        // subject_name: lectureSelected.subject_name
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
        //////////////////////////////////////////////////////
        // const sectionName = lectureSelect.options[lectureSelect.selectedIndex].text;

        // // Fetch student data based on the selected section
        // fetch(`/api/get_students_by_section?sectionName=${sectionName}`, {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // })
        //     .then(response => response.json())
        //     .then(studentsData => {
        //         // Assuming studentsData is an array of student objects
        //         console.log(studentsData);
        //         studentsData.forEach((student, index) => {
        //             const row = `<tr>
        //                 <td class="px-4 py-2 border border-gray-400">${index + 1}</td>
        //                 <td class="px-4 py-2 border border-gray-400">${student.STU_FNAME} ${student.STU_LNAME}</td>
        //                 <td class="px-4 py-2 border border-gray-400">${student.ENR_NUMBER}</td>
        //                 <td class="px-4 py-2 border border-gray-400"></td> <!-- For lecture attendance taken -->
        //                 <td class="px-4 py-2 border border-gray-400"></td> <!-- For total lectures -->
        //             </tr>`;
        //             tablebody.insertAdjacentHTML("beforeend", row);
        //         });
        //     })
        //     .catch(error => {
        //         console.error("Error fetching student data:", error);
        //     });



        ////////////////////////////////////////////////////////

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
    .then(lectureData => {
        // Loop through each item in lectureData and create an option element
        lectureData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.SECTION_ID; // Using SECTION_ID as the option value
            option.textContent = `${item.SECTION_NAME} - ${item.SUB_NAME}`;
            lectureSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


//////////////////////////
// // Function to fetch lectures taken and total lectures for a student
// function getLectureData(enr_number, sectionName, subjectName) {
//     fetch('/get-attendance-data', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ enr_number, section_name: sectionName, subject_name: subjectName })
//     })
//         .then(response => response.json())
//         .then(data => {
//             // Find the corresponding row for the student by ENR_NUMBER
//             const lecturesTakenElement = document.querySelector(`.lectures-taken-${enr_number}`);
//             const totalLecturesElement = document.querySelector(`.total-lectures-${enr_number}`);

//             if (lecturesTakenElement && totalLecturesElement) {
//                 // Update the table with fetched values
//                 lecturesTakenElement.textContent = data.lecturesTaken;
//                 totalLecturesElement.textContent = data.totalLectures;
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching attendance data:", error);
//         });
// }        