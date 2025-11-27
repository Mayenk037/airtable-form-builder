// backend/src/utils/shouldShowQuestion.js

/**
 * Condition:
 * {
 *   questionKey: string;
 *   operator: "equals" | "notEquals" | "contains";
 *   value: any;
 * }
 *
 * ConditionalRules:
 * {
 *   logic: "AND" | "OR";
 *   conditions: Condition[];
 * }
 *
 * shouldShowQuestion(
 *   rules: ConditionalRules | null,
 *   answersSoFar: Record<string, any>
 * ): boolean
 */

function evaluateCondition(answer, operator, expectedValue) {
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
}

function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true; // no rules => always show

  const { logic, conditions } = rules;
  if (!conditions || conditions.length === 0) return true;

  let result = logic === "AND";

  for (const condition of conditions) {
    const { questionKey, operator, value } = condition;
    const answer = answersSoFar[questionKey];

    const condResult = evaluateCondition(answer, operator, value);

    if (logic === "AND") {
      result = result && condResult;
      if (!result) return false; // early exit
    } else {
      // OR
      result = result || condResult;
      if (result) return true; // early exit
    }
  }

  return result;
}

module.exports = shouldShowQuestion;
