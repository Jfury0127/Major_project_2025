//import sql
import mysql from 'mysql2'

import dotenv from 'dotenv' // for enviornment variables file

dotenv.config()

const pool = mysql.createPool({
   host: process.env.MYSQL_HOST,
   user: process.env.MYSQL_USER,
   password: process.env.MYSQL_PASSWORD,
   database: process.env.MYSQL_DATABASE,
   connectionLimit: 10,
}).promise();

// ==================================================================================================

// this function takes the faculty id and return the password associated with it 
export async function chk_pass_from_id(id) {
   const [result] = await pool.query(
      'SELECT F_PASSWORD FROM faculty WHERE F_ID = ?', [id]);
   if (typeof (result[0]) == "undefined") return "undefined"
   return result[0].F_PASSWORD
}

export async function chk_t_lect_num(id) {
   const [result] = await pool.query(
      'SELECT COUNT(F_ID) AS RES FROM lecture WHERE F_ID = ?', [id]
   )
   const send = result[0].RES;
   return send
}
//=============================
// for student
export async function chk_pass_from_enr(id) {
   const [result2] = await pool.query(
      'SELECT STU_PASSWORD FROM student WHERE ENR_NUMBER = ?', [id]);
   if (result2.length === 0) return "undefined"; // Check length explicitly
   return result2[0].STU_PASSWORD;


}

//===========================================
//for hod login
export async function chk_pass_from_hod_id(id) {
   const [result3] = await pool.query('SELECT HOD_PASSWORD FROM hod WHERE HOD_ID = ?', [id]);
   if (result3.length === 0) return "undefined"; // Check length explicitly
   return result3[0].HOD_PASSWORD;
}

//////////////////////////////
export async function getLecture(f_id) {
   const [result2] = await pool.query(
      //'SELECT * FROM LECTURE WHERE F_ID = ?', [f_id]);
      'SELECT * FROM (SELECT subject.SUB_ID, subject.SUB_NAME, section.SECTION_ID, section.SECTION_NAME FROM lecture JOIN subject ON lecture.SUB_ID = subject.SUB_ID JOIN section ON lecture.SECTION_ID = section.SECTION_ID WHERE lecture.F_ID=?) AS FACULTY_LECTURES', [f_id]);
   return result2;
}

export async function getStudentData(sectionID) {
   const [result2] = await pool.query(
      'SELECT ENR_NUMBER,STU_FNAME,STU_LNAME FROM student WHERE SECTION_ID = ?', [sectionID]);
   return result2;
}

// this function is used to get the profile details of the teacher

export async function get_teacher_profile_details_from_id(id) {
   const [result] = await pool.query(
      'SELECT F_FNAME,F_LNAME,F_PHONE_NUMBER FROM faculty WHERE F_ID = ?', [id]
   )
   return result[0];
}

export async function update_teacher_profile(data, fid) {
   const new_data = data;
   if (new_data.fac_phone == '' || new_data.fac_phone == ' ') new_data.fac_phone = null;

   const result = await pool.query(
      'UPDATE faculty SET F_FNAME = ? , F_LNAME = ?, F_PHONE_NUMBER = ? WHERE F_ID = ?', [new_data.fac_fname, new_data.fac_lname, new_data.fac_phone, fid]
   )
}
// ///////////////////////////////////////////////////////////////////////////////////////////////////


export async function check_att_array_existance(sectionId, subID, attendanceDate) {
   // console.log(sectionId,subID,attendanceDate);
   const [result] = await pool.query(
      // check attendance existence on that date
      `select enr_number from attendance where sub_id=? AND section_id=? and attendance_date=?;`, [subID, sectionId, attendanceDate]
   )
   if (result.length == 0) {
      // no record of that day so attendance has not been marked previously
      return 0;
   }
   else {
      const [result2] = await pool.query(
         `select enr_number,status from attendance where sub_id=? AND section_id=? and attendance_date=?`, [subID, sectionId, attendanceDate]
      )
      // attendance of this day has been marked previously
      return result2;
   }
}

// Get sections based on year, excluding those already used with the selected subject
export const getAvailableSections = async (year, facultyId) => {
   const [sections] = await pool.query(
      'SELECT S.SECTION_ID, S.SECTION_NAME FROM section S LEFT JOIN lecture L ON S.SECTION_ID = L.SECTION_ID AND L.F_ID = ? WHERE S.SECTION_YEAR = ? AND L.SUB_ID IS NULL', [facultyId, year]
   )
   // console.log(sections);
   return sections;

}

// Get subjects based on semester, excluding those already used with the selected section
export const getAvailableSubjects = async (semester, sectionID) => {
   const [subjects] = await pool.query('SELECT SUB.SUB_ID, SUB.SUB_NAME FROM subject SUB WHERE SUB.SUB_SEM = ? AND SUB.SUB_ID NOT IN (SELECT L.SUB_ID FROM lecture L WHERE L.SECTION_ID = ?)', [semester, sectionID]);
   return subjects;
}

export const addLecture = async (facultyId, sectionId, subjectId) => {
   // Ensure that the section + subject combination doesn't already exist in the 'lecture' table
   const [existingLecture] = await pool.query(`SELECT * FROM lecture WHERE SECTION_ID = ? AND SUB_ID = ?`, [sectionId, subjectId]);
   //console.log(existingLecture);
   if (existingLecture.length > 0) {
      throw new Error("This lecture already exists.");
   }

   // Insert the new lecture
   await pool.query(`INSERT INTO lecture (F_ID, SECTION_ID, SUB_ID) VALUES (?, ?, ?)`, [facultyId, sectionId, subjectId]);
};


export const getExistingLectures = async (facultyId) => {
   const [rows] = await pool.query(`SELECT S.SECTION_NAME, SUB.SUB_ALIAS FROM lecture L JOIN section S ON L.SECTION_ID = S.SECTION_ID JOIN subject SUB ON L.SUB_ID = SUB.SUB_ID WHERE L.F_ID = ?`, [facultyId]);
   // console.log(rows);
   // console.log(facultyId);
   return rows;


};

export async function remove_lecture(section_name, subject_alias) {
   const result = await pool.query(`DELETE FROM lecture WHERE SUB_ID = (SELECT SUB_ID FROM subject WHERE SUB_ALIAS = ?) AND SECTION_ID = (SELECT SECTION_ID FROM section WHERE SECTION_NAME = ?);`, [subject_alias, section_name]);
   return result[0];
}


// Update an existing attendance entry
export async function updateAttendanceEntry(attendance_date, sub_id, section_id, enr_number, status) {
   const [result] = await pool.query(`UPDATE attendance SET status = ? WHERE attendance_date = ? AND sub_id = ? AND section_id = ? AND enr_number = ?`, [status, attendance_date, sub_id, section_id, enr_number])
   //  console.log(result);
   return result;

}

// Insert a new attendance entry
export async function insertattendanceEntry(attendance_date, sub_id, section_id, enr_number, status) {
   const [result] = await pool.query(`INSERT INTO attendance (attendance_id,attendance_date, sub_id, section_id, enr_number, status) VALUES (null,?, ?, ?, ?, ?)`, [attendance_date, sub_id, section_id, enr_number, status])
   return result;
}

///////
//view attendance ke liye
export async function getStudentsBySection(sectionName) {
   // Step 1: Get the section_id based on section_name from the section table
   const [section] = await pool.query(`SELECT section_id FROM section WHERE section_name = ?`, [sectionName]);

   // If section is not found
   if (section.length === 0) {
      throw new Error('Section not found');
   }

   const sectionId = section[0].section_id;

   // Step 2: Get students based on section_id
   const [students] = await pool.query(`SELECT ENR_NUMBER, STU_FNAME, STU_LNAME FROM student WHERE section_id = ?`, [sectionId]);
   return students;
}
export async function getLecturesTaken(enr_number, section_name, subject_name) {
   const [result] = await pool.query(`SELECT COUNT(attendance_id) AS lecturesTaken FROM attendance WHERE enr_number = ? AND section_id = (SELECT section_id FROM section WHERE section_name = ?) AND sub_id = (SELECT sub_id FROM subject WHERE sub_name = ?) AND status = 1;`, [enr_number, section_name, subject_name]);
   // const send1 = result[0].LRES;
   //return send1;
   try {
      //console.log(result[0]);
      return result[0]?.lecturesTaken || 0;
   } catch (error) {
      console.error("getLecturesTaken Error:", error);
      throw error;
   }
}
export async function getTotalLectures(section_name, subject_name) {
   const [result] = await pool.query(`SELECT COUNT(DISTINCT attendance_date) AS totalLectures FROM attendance WHERE section_id = (SELECT section_id FROM section WHERE section_name = ?) AND sub_id = (SELECT sub_id FROM subject WHERE sub_name = ?);`, [section_name, subject_name]);
   // console.log(result);
   // const send2 = result[0].TRES;
   //return send2;
   try {
      //console.log(result[0]);
      return result[0]?.totalLectures || 0;
      // Return count or 0 if no records found
   } catch (error) {
      console.error("getTotalLectures Error:", error);
      throw error;
   }
}

// func to get student data and student sub data from student ENR
export async function getStudentInfofromENR(studentENR) {
   const [result] = await pool.query(
      'SELECT ENR_NUMBER,STU_FNAME,STU_LNAME,SECTION_ID,STU_SEM FROM student WHERE ENR_NUMBER = ?', [studentENR]
   )
   const sem = result[0].STU_SEM;
   const section_id = result[0].SECTION_ID;

   const [studentSubjects] = await pool.query(
      `select * from subject where sub_sem = ?;`, [sem]
   )
   const [[section_name]] = await pool.query(
      `select SECTION_NAME from section where SECTION_ID=?;`, [section_id]
   )
   result[0].SECTION_NAME = section_name.SECTION_NAME;
   // console.log(result[0]);

   return ([result[0], studentSubjects]); //array of (object and array)
}

export async function fetchDetailedAttendance(enr, subId) {
   // console.log(subId,enr);
   // console.log(typeof(subId));
   const [result] = await pool.query(

      // `SELECT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date, status
      // FROM attendance where SUB_ID= '${subId}' AND ENR_NUMBER= ${enr};`)
      `SELECT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date, status
      FROM attendance where ENR_NUMBER= ? AND SUB_ID= ?;`, [enr, subId])

   //console.log(result);

   return result;

}

export async function hod_getsections(year) {
   const [result] = await pool.query(`select section_id, section_name from section where section_year = ?;`, [year])
   // console.log(result);
   return result;
}
export async function hod_get_subjects(sem) {
   const [result] = await pool.query(` select sub_id, sub_name from subject where sub_sem= ? ;`, [sem])
   // console.log(result);
   return result;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// major_project
// assignments code

// get lectures from existing function

// insert assignment into table i.e create assignment for one lecture by teacher

export async function create_Assignment(new_assignment_data, subject_alias, sec_name, reference_to_assignment) {

   const [result] = await pool.query(`Insert into assignment (SUB_ID, SECTION_ID ,Assign_Id , Assign_Name, 
                     Date_of_arr , Due_date , Remark,Ref_to_assignment) values ((select sub_id from subject where sub_alias=?),
                     (select section_id from section where section_name = ?),null,?,?,?,?,?);`
      , [subject_alias, sec_name, new_assignment_data.title, new_assignment_data.arrival_date, new_assignment_data.due_date
         , new_assignment_data.remarks, reference_to_assignment]);

   const assign_id = result.insertId;

   const [result2] = await pool.query(` INSERT INTO SUBMITS (enr_number, Assign_Id, Ref_to_submission,
       Date_of_submission, submit_status) SELECT enr_number, ?, NULL, NULL, 0 FROM student WHERE section_id = 
       (select section_id from section where section_name = ?);`
      , [assign_id, sec_name]);

   return result.affectedRows
}

// get assignments for one lecture
// lecture deatils = fid , sec_id , subject_id

export async function get_assignments_for_lecture(section_name, subject_alias) {
   const [result] = await pool.query(`select * from assignment where
      section_id = (SELECT section_id FROM section WHERE section_name = ?) AND
       sub_id = (SELECT sub_id FROM subject WHERE sub_alias = ?);`, [section_name, subject_alias]);

   // console.log(result);
   return result
}

//get assignment summary for particular, selected assignmnet (by faculty)

export async function get_assignments_summary(assign_id) {
   const [result] = await pool.query(`select assign_name,remark, date_of_arr, 
      due_date, ref_to_assignment from assignment where assign_id = ?;`, [assign_id]);

   //console.log(result);
   return result;
}

//get submissions summary for that particular assignment (by faculty)
export async function get_submissions_summary(assign_id) {
   const [result] = await pool.query(`select s.enr_number, (select stu.stu_fname from student stu where stu.enr_number = s.enr_number) as student_name, s.submit_status, s.date_of_submission, s.ref_to_submission from submits s where s.assign_id = ?;`, [assign_id]);

   //console.log(result);
   return result;
}

//student side assignment

export async function get_assignments_for_student(enr_number, sub_id,section_name) {
   const [result] = await pool.query(`
         SELECT A.Assign_Id,A.Assign_Name,A.Remark,A.Date_of_arr,A.Due_date,A.Ref_to_assignment,S.Date_of_submission,
         S.Ref_to_submission FROM ASSIGNMENT A JOIN SUBMITS S ON A.Assign_Id = S.Assign_Id
         WHERE S.Enr_Number = ? AND A.Sub_Id = ? AND A.Section_Id = (select section_id from section where section_name = ?);`, [enr_number, sub_id,section_name]);

   return result;
}

export async function remove_Assignment(Assign_Id) {

   const [result] = await pool.query(`
         Delete from Submits where Assign_Id = ?
         `, 
         [Assign_Id]);

   const [result2] = await pool.query(`
         Delete from Assignment where Assign_Id = ?
         `,
          [Assign_Id]);

   return result2.affectedRows;
}

export async function update_submission(ref_to_submission, submission_date, enr_number, assignment_id) {

   const [result] = await pool.query(`
      UPDATE SUBMITS
      SET Ref_to_submission = ?, Date_of_submission = ?,Submit_status = ? 
      WHERE Enr_Number = ? AND Assign_Id = ?;
   `, [ref_to_submission, submission_date,1, enr_number, assignment_id]);
   // console.log(result);
   return result;
}

// get student data for view attendance search button
export async function getStudentDataQuery(enr_num) {
   const [result] = await pool.query(
      `SELECT * FROM student WHERE enr_number = ?`,
      [enr_num]
   );
   return result;
}

// get student data for view attendance search button
export async function getStudentLecAttendance(enr_num,sub) {
   const [result] = await pool.query(
      `SELECT attendance_date as Date,status FROM ATTENDANCE WHERE enr_number = ? and SUB_ID = ?`,
      [enr_num,sub]
   );
   return result;
}

// modify student att - check if lecture taken on that day - if yes - modify it

export async function modifyAttendanceUsingDate(sectionId, subID, attendanceDate,enr,reason){
   
   const [result] = await pool.query(
      `SELECT * from attendance where SECTION_ID = ? and SUB_ID = ? AND ATTENDANCE_DATE = ?`,
      [sectionId, subID, attendanceDate]
   );
   
   if(typeof(result[0]) == 'undefined'){ 
      
      // lecture does not exist
      return 0;
   }else{
      const [result2] = await pool.query(
         `SELECT * from attendance where SECTION_ID = ? and SUB_ID = ? AND ATTENDANCE_DATE = ? AND ENR_NUMBER = ?`,
         [sectionId, subID, attendanceDate,enr]
      );
      
      
      if(typeof(result2[0]) == 'undefined'){ 
         
         // wrong enr number
         return 1;
      }else if(result2[0].STATUS == 1){
         
         // enr already marked present
         return 2;
      }
      else {
         const [result3] = await pool.query(
            `UPDATE attendance SET STATUS = 1 where SECTION_ID = ? and SUB_ID = ? AND ATTENDANCE_DATE = ? and ENR_NUMBER = ?`,
            [sectionId, subID, attendanceDate,enr]
         );      
         // updated succesfully
 
         const [result4] = await pool.query(
            `INSERT INTO MISC_ATTENDANCE VALUES(null,?,?,?,?,?)`,
            [attendanceDate,subID,sectionId,enr,reason]
         );      // added successfully

         console.log(result4);
         return 3;
      }
   }
   
}

// modifyAttendanceUsingDate(109,"HS_301","2025-05-09",136202722);

// get student data for view attendance search button
export async function getStudentGraceAttendanceForLecture(Sec_id,Sub_id) {
   const [result] = await pool.query(
      `SELECT * FROM MISC_ATTENDANE WHERE SECTION_ID = ? and SUB_ID = ?`,
      [Sec_id,Sub_id]
   );
   return result;
}


// pool.end();
////////////////////////////////////////
