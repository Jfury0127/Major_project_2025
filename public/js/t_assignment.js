let selectedLecture = null;

document.addEventListener("DOMContentLoaded", function () {

    // take stuff from ejs
    const exist_lec = document.getElementById("main-sec");
    const add_assignment_div = document.getElementById("add_assignm_class");

    const cancel_btn = document.getElementById("cancel_btn");
    const add_btn = document.getElementById("add");
    const somediv= document.getElementById("some_div");
    
    // load existing lectures when the page is rendered initially 
    const lecture_data = loadExistingLectures();
    
    // load the add assignment div 
    async function show_add_Assignment() {

        exist_lec.classList.add("hidden");
        add_assignment_div.classList.remove("hidden");
    
        somediv.innerHTML = ''; // clear previous if any
        
        // creating dynamic heading
        if (selectedLecture) {
            const heading = document.createElement('p');
            heading.className = "text-2xl font-semibold mb-4 text-left text-[#DB2878]";
            heading.innerHTML = `
                <span >Section</span>: ${selectedLecture.section} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span >Subject</span>: ${selectedLecture.sub_alias}
            `;

            // Create hidden input for section name
            const hiddenSection = document.createElement("input");
            hiddenSection.type = "hidden";
            hiddenSection.name = "section_name";
            hiddenSection.value = selectedLecture.section;
            
            // Create hidden input for subject name
            const hiddenSubject = document.createElement("input");
            hiddenSubject.type = "hidden";
            hiddenSubject.name = "subject_alias";
            hiddenSubject.value = selectedLecture.sub_alias;
            
            somediv.appendChild(heading);
            somediv.appendChild(hiddenSubject);
            somediv.appendChild(hiddenSection);
        } else {
            console.warn("No lecture selected before adding assignment.");
        }
    

    }
    add_btn.addEventListener("click", show_add_Assignment);

    // return from the add assignment div
    cancel_btn.addEventListener("click", (event) => {
        event.preventDefault();
        add_assignment_div.classList.add("hidden"); // Hide main section
        exist_lec.classList.remove("hidden");
    });


});

async function loadExistingLectures() {

    try {
        const response = await fetch('/getExistingLectures');
        const Lectures = await response.json();

        const container = document.getElementById('lecture-container');

        Lectures.forEach(lecture => {
            const div = document.createElement('div');

            // dynamically load assignments after lecture is clicked
            div.addEventListener("click", () => {
                selectedLecture = {
                    section: lecture.SECTION_NAME,
                    sub_alias: lecture.SUB_ALIAS
                };
            
                load_assignments(lecture.SECTION_NAME, lecture.SUB_ALIAS);
                // return {sec_name: lecture.SECTION_NAME,sub_alias: lecture.SUB_ALIAS}
              });

            div.className = "w-5/12 h-44 bg-white rounded-md m-3 hover:scale-x-105 flex flex-col justify-center items-center";
            // div.style.borderColor = "#DB2878";
            div.style.boxShadow = "0 0 8px rgb(228, 148, 184)";

            const text = document.createElement('p');
            text.className = "text-[black] mt-2";
            text.innerHTML = `Section : ${lecture.SECTION_NAME} <br> Subject : ${lecture.SUB_ALIAS}`;

            div.appendChild(text);
            container.appendChild(div);

        });

    } catch (error) {
        console.error("Error loading existing lectures:", error);
    }
}

async function load_assignments(sec_name,sub_alias) {
    
    const lec_data = {
        sec_name: sec_name,
        sub_alias: sub_alias
      };
    try {
        const load_existing_assignment_div = document.getElementById("assignemts_div");
        const note = document.getElementById("lecturePrompt");
        note.classList.add("hidden");
        load_existing_assignment_div.classList.remove("hidden");
        
        // fetch aexisting assignments fro this lecture
        const response = await fetch('/getExistingAssignments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(lec_data)
          });

        const Assignments = await response.json();
        // console.log("Existing assignments queries:", Assignments.isempty());
        
        const container = document.getElementById('assignment-container');
        
        // count the number of assignments recieved
        let numberofassign = 0;
        Assignments.forEach(i => {
            numberofassign = numberofassign + 1 ;
        })        
        
        if(numberofassign == 0) {
            container.replaceChildren();
            const msg = document.createElement('p');
            msg.className = "w-full flex justify-between items-center mt-2 pl-9 pr-2 pd-2";
            msg.innerHTML = `
                <span class="font-semibold text-base"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Seems like there are no assignments alloted for 
                this lecture .... Click the button below and add a new assignment</span>
    
                `;
            container.appendChild(msg);
        }
        else {container.replaceChildren();
        
            Assignments.forEach(i => {
                const assign_div = document.createElement('div');
                assign_div.id = "dynamic_assignment_div";
        
                assign_div.className = "w-full max-w-3xl bg-white rounded-md p-4 hover:scale-[1.02] transition transform flex flex-col justify-center items-start mx-auto shadow-md";
                assign_div.style.boxShadow = "0 0 10px rgba(219, 40, 120, 0.1)";
                
                const topRow = document.createElement('div');
                topRow.className = "w-full flex justify-between items-center mt-2";

                const assign_div_text = document.createElement('p');
                assign_div_text.className = "text-[black]";
                assign_div_text.innerHTML = `
                <span class="font-semibold text-base">Name:</span> ${i.Assign_Name} &nbsp;&nbsp;&nbsp;&nbsp;
                <span class="font-semibold text-base">Remark:</span> ${i.Remark}
                `;
                
                const buttonContainer = document.createElement('div');
                buttonContainer.className = "flex space-x-4 mt-4"; // Add spacing between buttons
                
                // View assignment Button
                const view_button = document.createElement('button');
                view_button.className = "ml-auto px-4 py-2 bg-pink-100 text-[#DB2878] rounded-md font-medium shadow-sm hover:bg-pink-200 transition";
                view_button.innerText = "View Assignment";
                view_button.style.background = "rgb(253, 241, 242)";
                
                view_button.onclick = () => {
                    const assignId = i.Assign_Id;
                    window.location.href = `/t_view_assignment?assign_id=${assignId}`;
                };
                
                // Delete assign Button
                const delete_button = document.createElement('button');
                delete_button.className = "ml-2 px-4 py-2 bg-pink-100 text-[#DB2878] rounded-md font-medium shadow-sm hover:bg-pink-200 transition";
                delete_button.innerText = "Delete Assignment";
                delete_button.style.background = "rgb(253, 241, 242)";
                
                delete_button.addEventListener("click", () => {
                    const assign__Id = i.Assign_Id;
                   delete_assignments(assign__Id);

                   // const result = response.json();
                    //console.log("from here js",result);
                    //if(result )
                    
                   
                    //alert(result.message || "Lecture added successfully");
                  });

                // Append buttons to container
                buttonContainer.appendChild(view_button);
                buttonContainer.appendChild(delete_button);

                topRow.appendChild(assign_div_text);
                // topRow.appendChild(view_button);
                // topRow.appendChild(delete_button);
                topRow.appendChild(buttonContainer);
                assign_div.appendChild(topRow);
                container.appendChild(assign_div);
            });
        }
    } catch (error) {
        console.error("Error loading existing assignments:", error);
    }
    
}

async function delete_assignments(assignId){

    const data = {assign_Id : assignId}
    const response = await fetch('/api/deleteAssignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

    const result_of_deletion = await response.json();
    console.log("in js : ",result_of_deletion);
    // Check if deletion was successful
    if (result_of_deletion === 1) {
        alert("Assignment deleted successfully!");
        window.location.reload(); // Reload the page
    } else {
        alert("Failed to delete assignment!");
    }

}
    // console.log("in js 1: ",result_of_deletion[0].affectedRows);
    // console.log("in js 2: ",result_of_deletion.affectedRows);

