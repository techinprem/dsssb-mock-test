(function () {
  function getFileName() {
    return window.location.pathname.split("/").pop();
  }

  function toNumber(v) {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  function getGlobal(names) {
    for (const name of names) {
      if (typeof window[name] !== "undefined") return window[name];
    }
    return undefined;
  }

  function countAttempted() {
    const possibleAnswers = getGlobal(["userAnswers", "selectedAnswers", "answers", "markedAnswers"]);

    if (Array.isArray(possibleAnswers)) {
      return possibleAnswers.filter(v => v !== null && v !== undefined && v !== "").length;
    }

    if (possibleAnswers && typeof possibleAnswers === "object") {
      return Object.values(possibleAnswers).filter(v => v !== null && v !== undefined && v !== "").length;
    }

    return document.querySelectorAll("input[type='radio']:checked").length || 0;
  }

  function getTotalQuestions() {
    const questions = getGlobal(["questions", "quizData", "questionData", "allQuestions"]);

    if (Array.isArray(questions)) return questions.length;

    return (
      document.querySelectorAll(".question").length ||
      document.querySelectorAll(".question-box").length ||
      document.querySelectorAll("[data-question]").length ||
      0
    );
  }

  function saveDetectedResult() {
    const fileName = getFileName();

    const totalQuestions = toNumber(
      getGlobal(["totalQuestions", "totalQ", "total"]) || getTotalQuestions()
    );

    const attempted = toNumber(
      getGlobal(["attempted", "attemptedQuestions", "attemptedCount"]) || countAttempted()
    );

    const correct = toNumber(
      getGlobal(["correct", "correctAnswers", "correctCount"])
    );

    const wrong = toNumber(
      getGlobal(["wrong", "incorrect", "wrongAnswers", "wrongCount"])
    );

    const negative = toNumber(
      getGlobal(["negative", "negativeMarks", "minusMarks"]) || wrong * 0.25
    );

    const marks = toNumber(
      getGlobal(["finalMarks", "score", "marks", "totalScore", "obtainedMarks"])
    );

    const notAttempted = Math.max(totalQuestions - attempted, 0);

    const resultData = {
      fileName: fileName,
      totalQuestions: totalQuestions,
      attempted: attempted,
      correct: correct,
      wrong: wrong,
      notAttempted: notAttempted,
      negative: negative,
      marks: marks,
      maxMarks: totalQuestions,
      percentage: totalQuestions > 0 ? ((marks / totalQuestions) * 100).toFixed(2) + "%" : "0%",
      date: new Date().toLocaleString()
    };

    if (totalQuestions > 0 || attempted > 0 || marks !== 0) {
      localStorage.setItem("mock_result_" + fileName, JSON.stringify(resultData));
    }
  }

  function attachAutoSave() {
    const oldSubmit = window.submitTest;

    if (typeof oldSubmit === "function" && !oldSubmit.__resultSaverAttached) {
      window.submitTest = function () {
        const output = oldSubmit.apply(this, arguments);
        setTimeout(saveDetectedResult, 500);
        setTimeout(saveDetectedResult, 1500);
        return output;
      };

      window.submitTest.__resultSaverAttached = true;
    }

    document.addEventListener("click", function (e) {
      const text = (e.target.innerText || e.target.value || "").toLowerCase();

      if (
        text.includes("submit") ||
        text.includes("result") ||
        text.includes("finish") ||
        text.includes("score") ||
        text.includes("test submit")
      ) {
        setTimeout(saveDetectedResult, 700);
        setTimeout(saveDetectedResult, 1800);
      }
    });
  }

  window.saveDetectedResult = saveDetectedResult;

  attachAutoSave();
  window.addEventListener("beforeunload", saveDetectedResult);
})();
