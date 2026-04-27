(function () {
  function getCurrentFileName() {
    return window.location.pathname.split("/").pop();
  }

  function numberValue(value) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  function saveMockResult(result) {
    const fileName = getCurrentFileName();

    const resultData = {
      fileName: fileName,
      totalQuestions: numberValue(result.totalQuestions),
      attempted: numberValue(result.attempted),
      correct: numberValue(result.correct),
      wrong: numberValue(result.wrong),
      notAttempted: numberValue(result.notAttempted),
      negative: numberValue(result.negative),
      marks: numberValue(result.marks),
      maxMarks: numberValue(result.maxMarks || result.totalQuestions),
      percentage: result.percentage || "0%",
      date: new Date().toLocaleString()
    };

    localStorage.setItem(
      "mock_result_" + fileName,
      JSON.stringify(resultData)
    );
  }

  window.saveMockResult = saveMockResult;
})();
