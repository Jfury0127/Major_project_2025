document.addEventListener("DOMContentLoaded", async () => {
    const assignmentId = sessionStorage.getItem("selectedAssignmentId"); // set this in previous page
  
    // Fetch and fill assignment summary
    const summaryRes = await fetch(`/t_view_assignment/${assignmentId}`);
    const summary = await summaryRes.json();
  
    document.getElementById("assignment-title").textContent = summary.title;
    document.getElementById("assignment-remark").textContent = summary.remark;
    document.getElementById("assignment-issue").textContent = `Issued On: ${summary.issue_date}`;
    document.getElementById("assignment-due").textContent = `Due Date: ${summary.due_date}`;
    document.getElementById("assignment-submitted").textContent = `Submitted: loading...`;
  
    // Fetch and render student submissions
    const submissionsTableBody = document.querySelector("#attendance-table tbody");

    const submissions = window.submissionsData || [];
  
    submissions.forEach((submission, index) => {
      const tr = document.createElement("tr");
      tr.classList.add("border-y-2");
  
      tr.innerHTML = `
        <td class="px-4 py-2">${index + 1}</td>
        <td class="px-4 py-2">${submission.enr_number}</td>
        <td class="px-4 py-2">${submission.student_name}</td>
        <td class="px-4 py-2">${submission.status === 1 ? 'Submitted' : 'Not Submitted'}</td>
        <td class="px-4 py-2">${submission.submission_date || '-'}</td>
        <td class="px-4 py-2">
          ${submission.status === 1 && submission.file_path ? `<a href="${submission.file_path}" class="text-blue-600 underline">Download</a>` : '—'}
        </td>
      `;
  
      submissionsTableBody.appendChild(tr);
    });
    document.getElementById("assignment-submitted").textContent = `Submitted: ${submittedCount} / ${submissions.length}`;
  });
  
  // Helpers
  function getSubmissionStatus(sub, dueDate) {
    if (!sub.status) return "Not Submitted";
    return new Date(sub.submission_date) <= new Date(dueDate) ? "On Time" : "Late Submission";
  }
  
  function getStatusColor(sub, dueDate) {
    if (!sub.status) return "text-red-600";
    return new Date(sub.submission_date) <= new Date(dueDate) ? "text-green-600" : "text-yellow-600";
  }
  