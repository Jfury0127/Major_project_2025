document.addEventListener("DOMContentLoaded", function () {

    const exist_lec = document.getElementById("main-sec");
    const add_assignment_div = document.getElementById("add_assignm_class");

    const cancel_btn = document.getElementById("cancel_btn");
    const add_btn = document.getElementById("add");

    async function show_add_Assignment() {
        exist_lec.classList.add("hidden"); // Hide main section
        add_assignment_div.classList.remove("hidden");

        // const abc = await response.json();
        // console.log("resonces " ,abc);
        
    }

    // async function remove_add_Assignment() {
    //     event.preventDefault();
    //     add_assignment_div.classList.add("hidden"); // Hide main section
    //     exist_lec.classList.remove("hidden");

    // }

    add_btn.addEventListener("click", show_add_Assignment);
    
    
    cancel_btn.addEventListener("click", (event) => {
        event.preventDefault();
        add_assignment_div.classList.add("hidden"); // Hide main section
        exist_lec.classList.remove("hidden");
    });


});