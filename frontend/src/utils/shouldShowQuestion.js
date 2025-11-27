export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true;

  const { logic, conditions } = rules;
  if (!conditions || conditions.length === 0) return true;

  const evaluate = (answer, operator, expectedValue) => {
    if (answer === undefined || answer === null) return false;

    switch (operator) {
      case "equals":
        return answer === expectedValue;
      case "notEquals":
        return answer !== expectedValue;
      case "contains":
        if (Array.isArray(answer)) {
          return answer.includes(expectedValue);
        }
        return String(answer).includes(String(expectedValue));
      default:
        return false;
    }
  };

  let result = logic === "AND";

  for (const cond of conditions) {
    const { questionKey, operator, value } = cond;
    const answer = answersSoFar[questionKey];
    const condResult = evaluate(answer, operator, value);

    if (logic === "AND") {
      result = result && condResult;
      if (!result) return false;
    } else {
      result = result || condResult;
      if (result) return true;
    }
  }

  return result;
}
