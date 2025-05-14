
import express from 'express'
const app = express()
const port = 3000
import ejsmate from "ejs-mate"
import path from 'node:path'
import { fileURLToPath } from 'url'
import session from 'express-session';
// to load pdfs and save in cloudinary
import multer from 'multer';
const router = express.Router();

// ===================================================================================
// importing data from database file

import { chk_pass_from_enr, chk_pass_from_id, chk_pass_from_hod_id, chk_t_lect_num,
     getLecture, getStudentData,get_teacher_profile_details_from_id,
      update_teacher_profile, getStudentInfofromENR,getAvailableSubjects, getAvailableSections,
       addLecture, remove_lecture, getExistingLectures, check_att_array_existance, insertattendanceEntry,
        updateAttendanceEntry, getStudentsBySection,getTotalLectures,getLecturesTaken,fetchDetailedAttendance
        ,hod_getsections,hod_get_subjects,create_Assignment,get_assignments_summary, get_submissions_summary,
        get_assignments_for_lecture,get_assignments_for_student,remove_Assignment,update_submission,
        getStudentDataQuery,getStudentLecAttendance,modifyAttendanceUsingDate,getStudentGraceAttendanceForLecture,getallData} from './database.js';


// importing cloud container created in cloudinary        
import {storage} from './cloud.js';
const upload = multer({ storage })

// ==================================================================================
app.set("view engine", "ejs");
app.engine("ejs", ejsmate);

const dirname = path.dirname(fileURLToPath(import.meta.url));
app.set("views", path.join(dirname, "/views")); // dirname gives current directory name in which the server file is and path.join is used to join all paths (html files saves with .ejs) with the views folder by default.

app.use(express.json()) //doing smthing very important
app.use(express.urlencoded({ extended: true })); //  is a middleware provided by Express that will process the request encoded form and will put all information into the request body object you receive in your handler function.

app.use(express.static(path.join(dirname, "public"))); // used to access static files and making them public 


//////////////////////////////
app.use(session({
    secret: 'yourSecretKey', // replace with a secure secret key
    resave: false,            // prevents session resaving if unmodified
    saveUninitialized: false, // prevents creating a session until stored data exists
    cookie: {
        // httpOnly: true,
        secure: false,
        // SameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000 //1 hour
    } // set to true in production with HTTPS

}));

// demo middleware to see how much time requests take to process on server written by the silent member

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
    });
    next();
});

//////////////////////
app.get("/", (req, res) => {
    // console.log(document.cookie);
    if (typeof (req.session.user) == "undefined") {
        // req.userxists = 0;
        res.render("index") //or index.ejs it's same        
    } else {
        req.session.userxists = 1;
        res.render("index")
    }
})
//for faculty login
async function t_func1(req, res) {
    // function called without post request i.e. when land on this page
    let text;
    if (typeof (req.session.userxists) != "undefined" && req.session.userxists == 1) {
        res.render("t_dashboard");
    }
    else if (typeof (req.dataProcessed) == "undefined") {
        text = "";
        res.render("teachers_login.ejs", { text });
    }
    else {
        let msg = req.dataProcessed.msgcode;
        if (msg == "wrong_username") {
            text = "User does not exist !";
            res.render("teachers_login", { text });
        } else if (msg == "wrong_password") {
            text = "Incorrect Password !";
            res.render("teachers_login", { text });
        } else if (msg == "right_zero_lec") {
            res.redirect("/teacher_edit");
            // res.render("teacher_editprofile");
        } else if (msg == "right_not_zero_lec") {
            res.redirect("/t_dashboard");
        } else {
            res.render("error_page.ejs");
        }
    }
}

async function t_func2(req, res, next) {

    const t_userid = req.body.t_userid_key;
    const t_password = req.body.t_pass_key;

    const check1 = await chk_pass_from_id(t_userid); // get actual value from database

    // authenticate user here

    // wrong username `
    req.dataProcessed = "";
    if (check1 == "undefined") {
        req.dataProcessed = { "msgcode": "wrong_username" }
    }
    // right username wrong password
    else if (check1 != t_password) {
        req.dataProcessed = { "msgcode": "wrong_password" };
    }
    // both correct - move to next page
    else {
        const t_lectures = await chk_t_lect_num(t_userid);
        req.session.user = { id: t_userid }; // Save user data in session
        if (t_lectures == 0) {
            // send to edit profile page to add lectures
            req.dataProcessed = { "msgcode": "right_zero_lec" }
        } else {
            // send to teacher dashboard - all status good
            req.dataProcessed = { "msgcode": "right_not_zero_lec" }
        }
    }
    return next();
}

app.get('/teacher_login', t_func1);
app.post('/teacher_login', t_func2, t_func1);

//===================================================
//for student
async function stu_func1(req, res) { //without post request i.e. when land on this page
    let text2;
    if (typeof (req.dataProcessed) == "undefined") {
        text2 = "";
        res.render("student_login.ejs", { text2 });
    }
    else {
        let msg2 = req.dataProcessed.mssgcode;
        if (msg2 == "wrong_username") {
            text2 = "User does not exist !";
            res.render("student_login", { text2 });
        } else if (msg2 == "wrong_password") {
            text2 = "Incorrect Password !";
            res.render("student_login", { text2 });
        } else if (msg2 == "stu_dashboard") {
            res.redirect("/stu_dashboard");
        }
        else {
            res.render("error_page.ejs");
        }
    }
}
async function stu_func2(req, res, next) {

    const stu_enr = req.body.stu_enr_key;
    const stu_pass = req.body.stu_pass_key;
    // console.log("Student Enrollment:", stu_enr);
    // console.log("Student Password:", stu_pass);
    const check2 = await chk_pass_from_enr(stu_enr); // get actual value from database
    // console.log("Password from DB:", check2);
    // authenticate user here

    // wrong username `
    req.dataProcessed = "";
    if (check2 == "undefined") {
        req.dataProcessed = { "mssgcode": "wrong_username" };
    }
    // right username wrong password
    else if (check2 != stu_pass) {
        req.dataProcessed = { "mssgcode": "wrong_password" };
    }
    // both correct - move to next page
    else {
        req.session.student = { s_enr: stu_enr };
        req.dataProcessed = { "mssgcode": "stu_dashboard" };
        // console.log("Login successful, redirecting to dashboard");
    }
    return next();
}

app.get('/student_login', stu_func1);
app.post('/student_login', stu_func2, stu_func1);

//============================================================
//for hod
async function hod_func1(req, res) { //without post request i.e. when land on this page
    let text2;
    if (typeof (req.dataProcessed) == "undefined") {
        text2 = "";
        res.render("hod_login.ejs", { text2 });
    }
    else {
        let msg2 = req.dataProcessed.mssgcode;
        if (msg2 == "wrong_username") {
            text2 = "User does not exist !";
            res.render("hod_login", { text2 });
        } else if (msg2 == "wrong_password") {
            text2 = "Incorrect Password !";
            res.render("hod_login", { text2 });
        } else if (msg2 == "h_dashboard") {
            res.redirect("/h_dashboard");
        }
        else {
            res.render("error_page.ejs");
        }
    }
}
async function hod_func2(req, res, next) {

    const hod_id = req.body.hod_id_key;
    const hod_pass = req.body.hod_pass_key;
    // console.log("HOD ID:", hod_id);
    // console.log("HOD Password:", hod_pass);
    const check3 = await chk_pass_from_hod_id(hod_id); // get actual value from database
    // console.log("Password from DB:", check3);
    // authenticate user here

    // wrong username `
    req.dataProcessed = "";
    if (check3 == "undefined") {
        req.dataProcessed = { "mssgcode": "wrong_username" };
    }
    // right username wrong password
    else if (check3 != hod_pass) {
        req.dataProcessed = { "mssgcode": "wrong_password" };
    }
    // both correct - move to next page
    else {
        req.session.hod = { hod_id: hod_id };
        req.dataProcessed = { "mssgcode": "h_dashboard" };
        // console.log("Login successful, redirecting to dashboard");
    }
    return next();
}

app.get('/hod_login', hod_func1);
app.post('/hod_login', hod_func2, hod_func1);

//============================================================
// JSON endpoint to send data to the frontend
//API
//TEACHER LECTURES FETCH 
app.get('/api/teacher_lectures', async (req, res) => {
    
    const f_id = req.session.user ? req.session.user.id : 10006; //for testing
    // const f_id = req.session.user.id;
    const teacherData = await getLecture(f_id); // Fetch TEACHER LECTURES based on teacher ID
    res.json(teacherData); // Send data as JSON to the frsontend

});

app.get('/api/teacher_details', async (req, res) => {

    const f_id = req.session.user ? req.session.user.id : 10006; //for testing
    // const f_id = req.session.user.id;
    const teacherData = await get_teacher_profile_details_from_id(f_id); // Fetch teacher detail based on teacher ID
    teacherData.F_ID = f_id;
    res.json(teacherData); // Send data as JSON to the frontend

});


//==============================================================
//STUDENT LIST FETCH
app.get('/api/get_students', async (req, res) => {
    const sectionId = req.query.section_id; // Get the section_id from query parameter
    const subID = req.query.sub_id;
    const attendanceDate = req.query.attendance_date;

    try {
        const students = await getStudentData(sectionId);
        // res.json(students); // Send the student data as JSON
        const attendanceStatus = await check_att_array_existance(sectionId, subID, attendanceDate);
        res.json({ stu: students, stat: attendanceStatus });
        
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ error: 'Failed to retrieve student data' });
    }
});
//==============================================================
//STUDENT LIST FETCH
app.get('/api/get_students', async (req, res) => {
    const sectionId = req.query.section_id; // Get the section_id from query parameter
    const subID = req.query.sub_id;
    const attendanceDate = req.query.attendance_date;

    try {
        const students = await getStudentData(sectionId);
        // res.json(students); // Send the student data as JSON
        const attendanceStatus = await check_att_array_existance(sectionId, subID, attendanceDate);
        res.json({ stu: students, stat: attendanceStatus });
        
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ error: 'Failed to retrieve student data' });
    }
});

//================================================================
//STUDENT DASHBOARD INFO FETCH
app.get('/api/studentInfo', async (req, res) => {
    const studentENR = req.session.student ?  req.session.student.s_enr : 137202722; // testing
    const studentInfo = await getStudentInfofromENR(studentENR);
    const studentpinfo = studentInfo[0];
    const studentSubjects = studentInfo[1];

    for (const subject of studentSubjects) {
        // console.log(`Processing Subject: ${studentpinfo.SECTION_NAME}, ${subject.SUB_NAME}`);
        subject["total_lec"] = await getTotalLectures(studentpinfo.SECTION_NAME, subject.SUB_NAME);
        subject['lec_taken'] = await getLecturesTaken(studentENR, studentpinfo.SECTION_NAME, subject.SUB_NAME);
         
    }

    res.json([studentpinfo, studentSubjects]);
});
// get student attendance to show in view attendance table
app.get('/api/get_students_by_section', async (req, res) => {
    const { sectionName } = req.query;

    try {
        const students = await getStudentsBySection(sectionName);
        res.json(students);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Failed to fetch student data' });
    }
});

// search student in view attendance api

app.get('/api/searchStuByTeacher',async(req,res) => {
    const enr_num = req.query.enr_num;
    try{
        const studata = await getStudentDataQuery(enr_num);
        res.json(studata);
    }
    catch(e){
        res.status(500).json({code:"error",errorMessage:e});
    }
});

// get attendance of the searched student

app.get('/api/searchStuAttendance',async(req,res) => {
    const enr_num = req.query.enr_num;
    const sub = req.query.sub;
    try{
        const studata = await getStudentLecAttendance(enr_num,sub);
        res.json(studata);
    }
    catch(e){
        res.status(500).json({code:"error",errorMessage:e});
    }
});

// view grace attendance - retrieve for a given lecture
app.get('/api/getGraceDataForLec',async(req,res) => {
    const Sec_id = req.query.section_id;
    const Sub_id = req.query.sub_id;

    try{
        const data = await getStudentGraceAttendanceForLecture(Sec_id,Sub_id);
        res.json({sorted_by_enr:data.Grace_data_by_enr});
    }
    catch(e){
        res.status(500).json({code:"error",errorMessage:e});
    }
});



app.post('/markAttendance', async (req, res) => {
    try {
        const attendanceData = req.body; // Array of attendance objects
        // Iterate through the data and insert/update attendance table
        // Check if an entry already exists
        var sec_id = attendanceData[0].section_id;
        var subj_id = attendanceData[0].sub_id;
        var att_date = attendanceData[0].attendance_date;
        const existingEntry = await check_att_array_existance(sec_id, subj_id, att_date);

        for (let entry of attendanceData) {
            var { attendance_date, enr_number, sub_id, section_id, status } = entry;
            enr_number = parseInt(enr_number);
            // console.log(entry);

            if (existingEntry == 0) {
                // Insert new entry
                const insert = await insertattendanceEntry(attendance_date, sub_id, section_id, enr_number, status);
            }

            else {
                // Update existing entry
                const update = await updateAttendanceEntry(attendance_date, sub_id, section_id, enr_number, status);
            }
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Error saving attendance.' });
    }
});

// mofify attendance in mark attendance 

//==============================================================
//STUDENT LIST FETCH
app.get('/api/modify_att', async (req, res) => {
    const sectionId = Number(req.query.section_id); // Get the section_id from query parameter
    const subID = String(req.query.sub_id);
    const attendanceDate = req.query.attendance_date;
    const formatted_Date = attendanceDate.split('T')[0];
    const enr = Number(req.query.form_enr);
    const reason = String(req.query.reason);
    
    try {
        const result = await modifyAttendanceUsingDate(sectionId, subID, formatted_Date,enr,reason);
        res.json(result);
        
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ error: 'Failed to retrieve student data' });
    }
});

// Endpoint to fetch lecture attendance data
app.post('/api/get_lectures_taken', async (req, res) => {
    const { enr_number, section_name, subject_name } = req.body;

    try {
        const lecturesTaken = await getLecturesTaken(enr_number, section_name, subject_name);
        // console.log('Lectures Taken:', lecturesTaken); // Debug log
        res.json({ lecturesTaken });
    } catch (error) {
        console.error('Error fetching lectures taken:', error);
        res.status(500).json({ error: 'Failed to fetch lectures taken' });
    }
});

// API to get total lectures for a lecture
app.post('/api/get_total_lectures', async (req, res) => {
    const { section_name, subject_name } = req.body;

    try {
        const totalLectures = await getTotalLectures(section_name, subject_name);
        // console.log('Total Lectures:', totalLectures); // Debug log
        res.json({ totalLectures });
    } catch (error) {
        console.error('Error fetching total lectures:', error);
        res.status(500).json({ error: 'Failed to fetch total lectures' });
    }
});


//API to fetch attendance data on the basis of Date Range
app.post('/api/getAttendanceDateRange', async (req, res) => {
    const { section_id, subject_id, startDate, endDate } = req.body;
  
    try {
      const attendanceData = await getallData(section_id, subject_id, startDate, endDate);
      res.json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).json({ error: 'Failed to fetch attendance data' });
    }
  });

  app.post('/view_attendance', async (req, res) => {
    const { section_id, subject_id, startDate, endDate } = req.body;
  
    const attendanceData = await getallData(section_id, subject_id, startDate, endDate);
  
    res.render('hod_view_att2', {
        section_id,
      subject_id,
      startDate,
      endDate,
      attendance: attendanceData
    });
  });
  
  
  



app.get("/teacher_edit", async (req, res) => {
    
    const f_id = req.session.user ? req.session.user.id : 10006; //for testing
    // const f_id = req.session.user.id;
    const r = await get_teacher_profile_details_from_id(f_id);

    let data = r;
    res.render("teacher_editprofile.ejs", { data, f_id });
 
})

app.post("/teacher_edit", (req, res) => {
    
    const f_id = req.session.user ? req.session.user.id : 10006; //for testing
    // const f_id = req.session.user.id;
    const t_profile_data = req.body;
    const result = update_teacher_profile(t_profile_data, f_id);
    res.redirect("/teacher_edit");
})

////////////////////////////////////////////

// Route to get sections based on selected year and facultyid
app.get("/get-sections", async (req, res) => {
    const facultyId = req.session.user.id;
    const { year } = req.query;
    let yr = 0;
    if (year == "First") {
        yr = 1;
    }
    else if (year == "Second") {
        yr = 2;
    }
    else if (year == "Third") {
        yr = 3;
    }
    else if (year == "Fourth") {
        yr = 4;
    }
    
    try {
        const sections = await getAvailableSections(yr, facultyId);
        res.json(sections);
    } catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ error: "Error fetching sections" });
    }
});

// Route to get subjects based on selected semester
app.get("/get-subjects", async (req, res) => {
    // const facultyId = req.session.user.id;
    const { semester, sectionID } = req.query;
    try {
        const subjects = await getAvailableSubjects(semester, sectionID);
        res.json(subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Error fetching subjects" });
    }
});

app.get('/getExistingLectures', async (req, res) => {
    
    const facultyId = req.session.user ? req.session.user.id : 10006; //for testing
    // const facultyId = req.session.user.id;
    try {
        const lectures = await getExistingLectures(facultyId);
        res.json(lectures);
    } catch (error) {
        console.error("Error fetching existing lectures:", error);
        res.status(500).json({ error: "Failed to fetch existing lectures" });
    }
});
// Route to add a lecture
app.post("/add-lecture", async (req, res) => {
    const { facultyId, sectionId, subjectId } = req.body;
    // console.log(sectionId);
    // console.log(req.body);
    
    try {
        const result = await addLecture(facultyId, sectionId, subjectId);
        res.json({ message: "Lecture added successfully" });
    } catch (error) {
        console.error("Error adding lecture:", error);
        res.status(500).json({ error: "Error adding lecture" });
    }
});


app.get("/t_dashboard", (req, res) => {
    res.render("t_dashboard")
})
app.get("/t_profile", (req, res) => {
    res.render("t_profile")
})

app.get("/t_view_attendance", (req, res) => {
    res.render("t_view_attendance")
})
app.get("/t_mark_attendance", (req, res) => {
    res.render("t_mark_attendance")
})

// render page nad load existing lectures
app.get("/t_assignment", (req, res) => {
    res.render("t_assignment")
})

// click lecture and load assignments 

app.post('/getExistingAssignments', async (req, res) => {
    try {
        const exassign = await get_assignments_for_lecture(req.body.sec_name,req.body.sub_alias);
        res.json(exassign);
    } catch (error) {
        console.error("Error fetching existing assign:", error);
        res.status(500).json({ error: "Failed to fetch existing assignments" });
    }
});

// delete assignment using assign_id
app.post('/api/deleteAssignments', async (req, res) => {
    try {
        const result = await remove_Assignment(req.body.assign_Id);
        res.json(result);
       // console.log(result);
    } catch (error) {
        console.error("Error deleting asignmetn", error);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
});

// return post request from form adding new assignment 
app.post("/t_assignment", upload.single('attachment') ,async(req, res) => {
    
    const sec_name = req.body.section_name; // T1
    
    const subject_alias = req.body.subject_alias; // operating system
    
    // req.file comes from the middle upload that sends the attachment to the cloud 
    // and return a array having path of assignment stored in cloud
    const reference = req.file.path;
    
    const new_assignment_data = req.body;
    
    try {
        const result = await create_Assignment(new_assignment_data,subject_alias,sec_name,reference);
       res.redirect("/t_assignment");
    } catch (error) {

        console.error("Error creating assignment:", error);
    }
    // res.redirect("/t_assignment")
    // res.json({ status: 'success' });
})


//assignment summary and submissions summary recieved by faculty for a particular assignment

app.get('/t_view_assignment', async (req, res) => {
    const assignmentId = req.query.assign_id;
    try {
      const rows = await get_assignments_summary(assignmentId);
      const assignment = rows[0]; // get the first row
      const submissionsrow= await get_submissions_summary(assignmentId);
      const submissions = Array.isArray(submissionsrow) ? submissionsrow : [];
 
    res.render('t_view_assignment.ejs', { 
    assignment: assignment,
    submissions: submissions
    });

    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });
  

app.get("/t_help", (req, res) => {
    res.render("t_help")
})
app.get("/t_logout", (req, res) => {
    res.render("t_logout")
})
app.get("/t_destroySession", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error occurred while logging out');
        }
        res.redirect('/teacher_login'); // Redirect to the login page
    });
})

app.get("/stu_destroySession", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error occurred while logging out');
        }
        res.redirect('/student_login'); // Redirect to the login page
    });
})



app.get("/student_login", (req, res) => {
    res.render("student_login")
})
app.get("/stu_dashboard", (req, res) => {
    res.render("stu_dashboard")
})
app.get('/stu_more_info', async (req, res) => {
    res.render('stu_more_info');
});

//assignment for students
app.post('/api/stuAssignments',async (req, res) => {
    const subId = req.body.subId;
    const secName = req.body.secName;
    const enr_number = req.body.enr_number;
    const getassign = await get_assignments_for_student(enr_number,subId,secName);
    res.json({assignmentdata:getassign});

});

app.post('/api/submitAssignment', upload.single('assignment_file'), async (req, res) => {
    try {
        const { assignment_id, enr_number ,date} = req.body;
        const filee = req.file;
        if (!filee) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const submission_date = date;
        const ref_to_submission = filee.path;

        // Update the submits table
        const updatesubmission = await update_submission(ref_to_submission, submission_date, enr_number, assignment_id);
        res.status(200).json({ message: 'Assignment submitted successfully!' });

    } catch (err) {
        console.error('Submission Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/detailedStuAttendance',async (req, res) => {
    const {subId} = req.query;
    const enr = req.session.student ?  req.session.student.s_enr : 137202722; // testing
    const detailedAttendance = await fetchDetailedAttendance(enr, subId);
    //console.log(detailedAttendance);
    res.json(detailedAttendance);
})



app.get("/hod_login",(req,res)=>{
    res.render("hod_login")
})
// app.get("/hod_dashboard",(req,res)=>{
//     res.render("hod_dashboard")
// })
app.get("/h_dashboard",(req,res)=>{
    res.render("h_dashboard")
})
app.get("/h_report_generation",(req,res)=>{
    res.render("h_report_generation")
})
app.get("/h_logout", (req, res) => {
    res.render("h_logout")
})

app.get("/hod_destroySession", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error occurred while logging out');
        }
        res.redirect('/hod_login'); // Redirect to the login page
    });
})

app.get("/api/hod_get_Section", async (req, res) => {
    const { year } = req.query;
    if (!year) {
        return res.status(400).send('Year is required');
    }

    try {
        const sec = await hod_getsections(year);
        res.json(sec);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get("/api/hod-get-subjects", async (req, res) => {
    const { semester } = req.query;
    if (!semester) {
        return res.status(400).send('Year is required');
    }

    try {
        const subjects = await hod_get_subjects(semester);
        res.json(subjects);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/hod_view_att', async (req, res) => {
    res.render('hod_view_att');
});


app.get('/contactUs', async (req, res) => {
    res.render('contactus');
});

// prevent chrome spam
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send(); // 204 = No Content
});

app.use((req, res, next) => {
    res.status(404).render("error_page");
})


function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
}

// Getting today's date
const today = new Date();
const todayFormatted = getFormattedDate(today);
console.log(todayFormatted);


app.listen(port, () => {
    console.log("server is listening on http://localhost:3000/");
})
