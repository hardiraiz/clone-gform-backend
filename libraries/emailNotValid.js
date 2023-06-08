import isEmailValid from "./isEmailValid.js";

const emailNotValid = async (form, answers) => {
    const found = form.questions.filter((question) => {
        if(question.type == 'Email') {
            const answer = answers.find((answer) => answer.questionId == question.id);

            // skip pengecekan email jika empty dan question is not required
            if(question.required === false) {
                if(answer === undefined || answer.value === undefined ||
                    answer.value === null || answer.value.length == 0) {
                        return false;
                    }
            }

            if(answer) {
                if(!isEmailValid(answer.value)) {
                    return true;
                }
            }
        }
    });

    return found;
}

export default emailNotValid;
