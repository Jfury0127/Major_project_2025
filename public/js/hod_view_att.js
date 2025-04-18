// async function getAtt(){
const urlParams = new URLSearchParams(window.location.search);
const secID = urlParams.get("secID");
const secName = urlParams.get("secName");
const subID = urlParams.get("subID");
const subName = urlParams.get("subName");
const sectionID = secID;

fetch(`/api/get_students?section_id=${sectionID}`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
})
  .then((response) => response.json())
  .then((data) => {
    // Get student data from the response (assuming data has "stu" as the students array)
    const rowsData = data.stu;
    const tablebody = document.querySelector("tbody");
    tablebody.innerHTML = ""; // Clear existing rows
    //////////////////////////////////////////////////////////////////////////////
    // Fetch total lectures for the section and subject
    fetch("/api/get_total_lectures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_name: secName,
        subject_name: subName,
      }),
    })
      .then((response) => response.json())
      .then((totalData) => {
        const totalLectures = totalData.totalLectures || 0; // Default to 0 if no lectures
        ///////////////////////////////////
        // Loop through each student and add rows to the table
        rowsData.forEach((student, index) => {
          if (student.STU_LNAME == null) {
            student.STU_LNAME = "";
          }
          const row = `<tr>
            <td class="px-4 py-2 border border-gray-400">${index + 1}</td>
            <td class="px-4 py-2 border border-gray-400">${
              student.ENR_NUMBER
            }</td>
            <td class="px-4 py-2 border border-gray-400">${student.STU_FNAME} ${
            student.STU_LNAME
          }</td>
            <td class="px-4 py-2 border border-gray-400 lectures-taken-${
              student.ENR_NUMBER
            }">Loading...</td> <!-- For lecture attendance taken -->
            <td class="px-4 py-2 border border-gray-400 total-lectures">${totalLectures}</td> <!-- For total lectures -->
            <td class="px-4 py-2 border border-gray-400 percentage-${
              student.ENR_NUMBER
            }">Loading...></td> <!-- For percentage of lectures -->
            </tr>`;
          tablebody.insertAdjacentHTML("beforeend", row);
          // Fetch lectures taken for each student
          fetch("/api/get_lectures_taken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enr_number: student.ENR_NUMBER,
              section_name: secName,
              subject_name: subName,
            }),
          })
            .then((response) => response.json())
            .then((lecturesData) => {
              const lecturesTaken = lecturesData.lecturesTaken || 0; // Default to 0 if no lectures
              const lecturesTakenElement = document.querySelector(
                `.lectures-taken-${student.ENR_NUMBER}`
              );
              const percentageElement = document.querySelector(
                `.percentage-${student.ENR_NUMBER}`
              );

              if (lecturesTakenElement) {
                lecturesTakenElement.textContent = lecturesTaken;
              }
              if (percentageElement) {
                const percentage =
                  totalLectures > 0
                    ? ((lecturesTaken / totalLectures) * 100).toFixed(2)
                    : 0;
                percentageElement.textContent = `${percentage}%`;
              }
            })
            .catch((error) => {
              console.error(
                `Error fetching lectures taken for ${student.ENR_NUMBER}:`,
                error
              );
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching total lectures:", error);
      });
  })

  .catch((error) => {
    console.error("Error fetching student data:", error);
  });
