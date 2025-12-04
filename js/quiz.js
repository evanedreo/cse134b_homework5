(function () {
  const section = document.querySelector("#quiz");
  if (!section) return;

  const questions = section.querySelectorAll(".quiz-question");
  const checkButton = section.querySelector("#check-answers");
  const resetButton = section.querySelector("#reset-quiz");
  const scoreOutput = section.querySelector("#quiz-score");

  function clearFeedback() {
    questions.forEach((question) => {
      const feedback = question.querySelector(".quiz-feedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "quiz-feedback";
      }

      question.classList.remove(
        "quiz-question--correct",
        "quiz-question--incorrect",
        "quiz-question--unanswered"
      );

      const labels = question.querySelectorAll("label");
      labels.forEach((label) => {
        label.dataset.state = "";
      });
    });
    if (scoreOutput) {
      scoreOutput.textContent = "";
    }
  }

  function handleCheckAnswers() {
    if (!questions.length) return;

    let correctCount = 0;
    let answeredCount = 0;

    questions.forEach((question) => {
      const answer = question.dataset.answer;
      const inputs = question.querySelectorAll('input[type="radio"]');
      const feedback = question.querySelector(".quiz-feedback");

      if (!answer || !inputs.length || !feedback) return;

      let chosenValue = "";
      let chosenInput = null;
      inputs.forEach((input) => {
        if (input.checked) {
          chosenValue = input.value;
          chosenInput = input;
        }
      });

      if (!chosenValue) {
        feedback.textContent = "Choose an answer to this question.";
        feedback.className = "quiz-feedback quiz-feedback--unanswered";
        question.classList.remove(
          "quiz-question--correct",
          "quiz-question--incorrect"
        );
        question.classList.add("quiz-question--unanswered");
        return;
      }

      answeredCount += 1;

      // Reset per-question visual state before applying new one
      question.classList.remove(
        "quiz-question--correct",
        "quiz-question--incorrect",
        "quiz-question--unanswered"
      );
      const labels = question.querySelectorAll("label");
      labels.forEach((label) => {
        label.dataset.state = "";
      });

      if (chosenValue === answer) {
        correctCount += 1;
        feedback.textContent = "Nice! That's correct.";
        feedback.className = "quiz-feedback quiz-feedback--correct";

         // Highlight entire question and chosen label as correct
        question.classList.add("quiz-question--correct");
        if (chosenInput) {
          const chosenLabel = chosenInput.closest("label");
          if (chosenLabel) {
            chosenLabel.dataset.state = "correct";
          }
        }
      } else {
        const correctInput = question.querySelector(
          'input[type="radio"][value="' + answer + '"]'
        );
        const correctLabel = correctInput
          ? correctInput.closest("label")
          : null;
        const correctText = correctLabel
          ? correctLabel.textContent.trim()
          : "the correct answer";

        feedback.textContent =
          "Not quite. The correct answer is: " + correctText + ".";
        feedback.className = "quiz-feedback quiz-feedback--incorrect";

        // Highlight question card and both chosen + correct options
        question.classList.add("quiz-question--incorrect");

        if (chosenInput) {
          const chosenLabel = chosenInput.closest("label");
          if (chosenLabel) {
            chosenLabel.dataset.state = "incorrect";
          }
        }
        if (correctLabel) {
          correctLabel.dataset.state = "correct";
        }
      }
    });

    if (!scoreOutput) return;

    if (answeredCount === 0) {
      scoreOutput.textContent =
        "Answer at least one question to see your score.";
      return;
    }

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    scoreOutput.textContent =
      "You answered " +
      correctCount +
      " out of " +
      total +
      " correctly (" +
      percentage +
      "%).";
  }

  function handleResetQuiz() {
    questions.forEach((question) => {
      const inputs = question.querySelectorAll('input[type="radio"]');
      inputs.forEach((input) => {
        input.checked = false;
      });
    });
    clearFeedback();
  }

  if (checkButton) {
    checkButton.addEventListener("click", handleCheckAnswers);
  }
  if (resetButton) {
    resetButton.addEventListener("click", handleResetQuiz);
  }
})();


