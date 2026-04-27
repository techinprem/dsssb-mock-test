(function () {
  function getFileName() {
    return window.location.pathname.split("/").pop();
  }

  function toNumber(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  function saveHomePageResult(score, correct, wrong, un) {
    const fileName = getFileName();
    const totalQuestions = Array.isArray(window.QUESTIONS) ? window.QUESTIONS.length : 100;

    const finalMarks = toNumber(score);
    const correctCount = toNumber(correct);
    const wrongCount = toNumber(wrong);
    const unattempted = toNumber(un);
    const attempted = Math.max(totalQuestions - unattempted, 0);
    const negativeMarks = wrongCount * 0.25;

    const resultData = {
      fileName: fileName,
      totalQuestions: totalQuestions,
      attempted: attempted,
      correct: correctCount,
      wrong: wrongCount,
      notAttempted: unattempted,
      negative: negativeMarks.toFixed(2),
      marks: finalMarks.toFixed(2),
      maxMarks: totalQuestions,
      percentage: totalQuestions > 0 ? ((finalMarks / totalQuestions) * 100).toFixed(2) + "%" : "0%",
      date: new Date().toLocaleString()
    };

    localStorage.setItem("mock_result_" + fileName, JSON.stringify(resultData));
  }

  function attachToSaveHistory() {
    if (typeof window.saveHistory === "function" && !window.saveHistory.__homeResultAttached) {
      const oldSaveHistory = window.saveHistory;

      window.saveHistory = function (score, correct, wrong, un) {
        const output = oldSaveHistory.apply(this, arguments);
        saveHomePageResult(score, correct, wrong, un);
        return output;
      };

      window.saveHistory.__homeResultAttached = true;
    }
  }

  function attachToSubmitButton() {
    document.addEventListener("click", function (e) {
      const text = (e.target.innerText || e.target.value || "").toLowerCase();

      if (
        text.includes("submit") ||
        text.includes("result") ||
        text.includes("finish")
      ) {
        setTimeout(attachToSaveHistory, 100);
      }
    });
  }

  attachToSaveHistory();
  attachToSubmitButton();

  setTimeout(attachToSaveHistory, 500);
  setTimeout(attachToSaveHistory, 1500);
  setTimeout(attachToSaveHistory, 3000);
})();
